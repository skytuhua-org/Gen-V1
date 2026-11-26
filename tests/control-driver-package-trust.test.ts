import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { verifyPackagedControlDriver } from '../apps/server/host.ts';
import { REQUIRED_RUNTIME_FILES, writeControlDriverPackageTrust } from '../scripts/desktop-assets.ts';

const nativeBytes = 'inert addon fixture';
const archiveBytes = 'inert archive fixture';
const digest = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
let resources: string;
let host: string;
let manifest: ReturnType<typeof registrationClaim>;

function registrationClaim(artifact: string, adapterModule: string) {
  return {
    driverId: 'gen-v1-windows-control-bridge',
    artifact,
    artifactSha256: digest(nativeBytes),
    adapterModule,
    adapterModuleSha256: digest(archiveBytes),
    apiProtocols: ['browser-tab', 'native-window'],
    backendProofRef: 'electron/0.6.5',
    targetIdentityFormat: 'gen-v1.control-target.v1',
    captureBounds: { maxWidth: 8192, maxHeight: 8192, maxBytes: 33554432 },
    stopRoute: 'HOST_CANCEL',
  };
}

beforeEach(async () => {
  resources = await mkdtemp(join(tmpdir(), 'harness-control-package-trust-'));
  host = join(resources, 'host');
  manifest = registrationClaim(join(host, 'packages/core/windows-control-bridge.node'), join(resources, 'app.asar'));
  await mkdir(dirname(manifest.artifact), { recursive: true });
  await Promise.all([writeFile(manifest.artifact, nativeBytes), writeFile(manifest.adapterModule, archiveBytes)]);
});

afterEach(async () => {
  await rm(resources, { recursive: true, force: true });
});

it('requires the build-generated control driver trust resource in the packaged host', () => {
  expect(REQUIRED_RUNTIME_FILES).toContain('host/control-driver-trust.json');
});

it('registers the two packaged protocols using the native build digest', async () => {
  await writeControlDriverPackageTrust(resources, digest(nativeBytes));

  const registrations = await verifyPackagedControlDriver(host, '0.6.5', manifest);
  expect(registrations.map(({ apiProtocol, packageDigest }) => [apiProtocol, packageDigest])).toEqual([
    ['browser-tab', digest(nativeBytes)],
    ['native-window', digest(nativeBytes)],
  ]);
});

it('requires a valid build-generated resource even when both fixture files are present', async () => {
  await expect(verifyPackagedControlDriver(host, '0.6.5', manifest)).rejects.toMatchObject({ code: 'DRIVER_UNAVAILABLE' });
  await writeFile(join(host, 'control-driver-trust.json'), JSON.stringify({ version: 1, artifactSha256: manifest.artifactSha256 }));
  await expect(verifyPackagedControlDriver(host, '0.6.5', manifest)).rejects.toMatchObject({ code: 'DRIVER_UNAVAILABLE' });
});

it('pins both paths, both digests, and the backend identity to the package', async () => {
  await writeControlDriverPackageTrust(resources, digest(nativeBytes));

  for (const overrides of [
    { artifact: join(host, 'alternate.node') },
    { adapterModule: null, adapterModuleSha256: null },
    { adapterModule: join(resources, 'different.asar') },
    { artifactSha256: '0'.repeat(64) },
    { adapterModuleSha256: '0'.repeat(64) },
    { backendProofRef: 'electron/fixture' },
  ]) {
    await expect(verifyPackagedControlDriver(host, '0.6.5', { ...manifest, ...overrides }))
      .rejects.toMatchObject({ code: 'DRIVER_ARTIFACT_MISMATCH' });
  }
});

it('requires current package bytes for both sources', async () => {
  await writeControlDriverPackageTrust(resources, digest(nativeBytes));

  await writeFile(manifest.adapterModule, 'different inert archive fixture');
  await expect(verifyPackagedControlDriver(host, '0.6.5', manifest)).rejects.toMatchObject({ code: 'DRIVER_ARTIFACT_MISMATCH' });
  await writeFile(manifest.adapterModule, archiveBytes);
  await writeFile(manifest.artifact, 'different inert addon fixture');
  await expect(verifyPackagedControlDriver(host, '0.6.5', manifest)).rejects.toMatchObject({ code: 'DRIVER_ARTIFACT_MISMATCH' });
  await unlink(manifest.artifact);
  await expect(verifyPackagedControlDriver(host, '0.6.5', manifest)).rejects.toMatchObject({ code: 'DRIVER_ARTIFACT_MISMATCH' });
});

it('refuses to package an addon whose staged bytes differ from the native build', async () => {
  await expect(writeControlDriverPackageTrust(resources, digest('different inert build fixture')))
    .rejects.toThrow('Packaged control addon differs from the native build output.');
  await expect(verifyPackagedControlDriver(host, '0.6.5', manifest)).rejects.toMatchObject({ code: 'DRIVER_UNAVAILABLE' });
});
