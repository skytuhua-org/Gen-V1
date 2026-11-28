"""Stale or foreign completed-write receipts cannot dispatch a post-edit hook.

The worker-level bind_completed_writes admission control is the custody
boundary: a receipt whose owner (threadId/epoch/runId lineage) or revision
does not match the source turn is reported 'stale' and is never admitted to
the integrations hook, so zero observation dispatch follows it.
"""
import importlib.util
import re
import threading
import unittest
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]

spec = importlib.util.spec_from_file_location("harness_completed_writes_stale", ROOT / "packages/runtime-hermes/worker.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

SHA = "a" * 64


def make_worker():
    worker = module.Worker()
    events = []
    worker.event = lambda name, payload=None: events.append((name, payload))
    worker.cancelled = threading.Event()
    worker.agent = object()
    worker.active_owner = True
    worker.foreground_active = True
    worker.ctx = {"threadId": "thread-1", "runId": "run-current", "epoch": 7}
    worker.params = {
        "completedWrites": [],
        "inputIds": [],
        "modelId": "model-1",
        "accountId": "account-1",
        "sessionPath": "/sessions/s1",
        "projectRoot": "/project",
        "ctx": worker.ctx,
    }
    return worker, events


def valid_receipt(**overrides):
    receipt = {
        "operationId": "op-1",
        "revision": 1,
        "inputId": "operation-result:op-1",
        "delivery": {"threadId": "thread-1", "runId": "run-current", "epoch": 7},
        "origin": {
            "threadId": "thread-1", "epoch": 6, "runId": "run-prior",
            "modelId": "model-1", "accountId": "account-1",
            "sessionPath": "/sessions/s1", "projectId": "project-1",
            "workspaceId": "ws-1", "projectRoot": "/project",
        },
        "path": "/project/a.ts",
        "bytes": 4,
        "sha256": SHA,
    }
    receipt.update(overrides)
    return receipt


def bind(worker, receipts):
    admitted = []
    integrations = SimpleNamespace(
        enabled={"impeccable"},
        on_hook_execution=None,
        bind_completed_writes=lambda agent, batch, guard, report: admitted.extend(batch),
    )
    worker.integrations = integrations
    worker.params["completedWrites"] = receipts
    worker.params["inputIds"] = [receipt["inputId"] for receipt in receipts]
    finish = worker.bind_completed_writes(worker.params)
    return admitted, finish


class CompletedWritesStale(unittest.TestCase):
    def test_matching_receipt_is_admitted(self):
        worker, events = make_worker()
        admitted, finish = bind(worker, [valid_receipt()])
        finish()
        self.assertEqual(len(admitted), 1)
        # The hook confirmed nothing yet: the source turn reports the pending
        # outcome as unknown, never as success.
        statuses = [payload["diagnostic"]["status"] for name, payload in events if name == "write_hook"]
        self.assertEqual(statuses, ["unknown"])

    def test_stale_owner_epoch_and_runid_dispatch_nothing(self):
        worker, events = make_worker()
        stale_epoch = valid_receipt(operationId="op-epoch", inputId="operation-result:op-epoch")
        stale_epoch["origin"]["epoch"] = 4  # not ctx.epoch - 1
        stale_run = valid_receipt(operationId="op-run", inputId="operation-result:op-run")
        stale_run["origin"]["runId"] = "run-current"  # must differ from ctx.runId
        stale_revision = valid_receipt(operationId="op-rev", inputId="operation-result:op-rev")
        stale_revision["revision"] = 0
        admitted, finish = bind(worker, [stale_epoch, stale_run, stale_revision])
        finish()
        # Every stale receipt is reported 'stale' once; none is admitted to the
        # integrations hook, so no hook event can dispatch from them.
        self.assertEqual(admitted, [])
        statuses = [payload["diagnostic"]["status"] for name, payload in events if name == "write_hook"]
        self.assertEqual(sorted(statuses), ["stale", "stale", "stale"])

    def test_receipt_from_a_foreign_thread_is_stale(self):
        worker, events = make_worker()
        foreign = valid_receipt()
        foreign["origin"]["threadId"] = "thread-other"
        admitted, finish = bind(worker, [foreign])
        finish()
        self.assertEqual(admitted, [])
        statuses = [payload["diagnostic"]["status"] for name, payload in events if name == "write_hook"]
        self.assertEqual(statuses, ["stale"])

    def test_cancelled_owner_cannot_dispatch_a_late_report(self):
        worker, events = make_worker()
        admitted, finish = bind(worker, [valid_receipt()])
        worker.cancelled.set()  # owner revoked before the hook reported
        finish()
        statuses = [payload["diagnostic"]["status"] for name, payload in events if name == "write_hook"]
        # The pending diagnostic flushes to 'unknown' inside this turn; a later
        # callback is fenced by the guard and cannot emit success.
        self.assertEqual(statuses, ["unknown"])
        self.assertEqual(len(admitted), 1)


if __name__ == "__main__":
    unittest.main()
