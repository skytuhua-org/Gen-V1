import {useEffect, useRef, useState} from 'react';

export const imageLoadMessages = {
  unavailable: 'The image is unavailable. Check its grant and retry.',
  unreadable: 'This resource is not a readable image.',
  timeout: 'The image is taking too long to load. Check access and retry.',
} as const;

export function ArtifactImage({resourceId, alt}: {resourceId: string; alt: string}) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | keyof typeof imageLoadMessages>('loading');
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state !== 'loading' || !frame.current) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    // A native image with lazy loading may wait indefinitely outside the viewport.
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || timeout !== undefined) return;
      observer.disconnect();
      timeout = setTimeout(() => setState(current => current === 'loading' ? 'timeout' : current), 15_000);
    });
    observer.observe(frame.current);
    return () => { observer.disconnect(); observer.takeRecords(); clearTimeout(timeout); };
  }, [attempt, state]);

  const message = state === 'loading' || state === 'ready' ? undefined : imageLoadMessages[state];
  const src = `/api/resources/${encodeURIComponent(resourceId)}/content${attempt ? `?imageRetry=${attempt}` : ''}`;
  return (
    <div className="artifact-image-frame" ref={frame}>
      {message ? (
        <div className="artifact-image-error" role="alert">
          <p>{message}</p>
          <button type="button" className="secondary" onClick={() => {
            setState('loading');
            setAttempt(value => value + 1);
          }}>Retry image</button>
        </div>
      ) : (
        <img key={attempt} className="surface-image" src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" data-loading={state==='loading' || undefined}
          onLoad={event => setState(event.currentTarget.naturalWidth && event.currentTarget.naturalHeight ? 'ready' : 'unreadable')}
          onError={() => setState('unavailable')} />
      )}
    </div>
  );
}
