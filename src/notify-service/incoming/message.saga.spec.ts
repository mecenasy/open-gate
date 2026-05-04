import { Subject } from 'rxjs';
import { Platform } from '../types/platform';
import { MessageEvent } from './event/message.event';
import { MessageSaga } from './message.saga';

describe('MessageSaga.identify', () => {
  let saga: MessageSaga;

  beforeEach(() => {
    saga = new MessageSaga();
  });

  it('emits a MessageEvent for events with both message and platform set', (done) => {
    const events$ = new Subject<unknown>();
    const out: MessageEvent[] = [];
    saga.identify(events$).subscribe((cmd) => {
      out.push(cmd as MessageEvent);
    });

    events$.next(new MessageEvent({ ok: true }, Platform.Signal, 't-1'));

    setImmediate(() => {
      expect(out).toHaveLength(1);
      expect(out[0]).toBeInstanceOf(MessageEvent);
      expect(out[0].message).toEqual({ ok: true });
      expect(out[0].platform).toBe(Platform.Signal);
      done();
    });
  });

  it('filters out events with falsy message', (done) => {
    const events$ = new Subject<unknown>();
    const out: MessageEvent[] = [];
    saga.identify(events$).subscribe((cmd) => out.push(cmd as MessageEvent));

    events$.next(new MessageEvent(null, Platform.Signal));

    setImmediate(() => {
      expect(out).toHaveLength(0);
      done();
    });
  });

  it('filters out events with falsy platform', (done) => {
    const events$ = new Subject<unknown>();
    const out: MessageEvent[] = [];
    saga.identify(events$).subscribe((cmd) => out.push(cmd as MessageEvent));

    events$.next(new MessageEvent({ ok: true }, '' as unknown as Platform));

    setImmediate(() => {
      expect(out).toHaveLength(0);
      done();
    });
  });

  it('ignores non-MessageEvent items via ofType', (done) => {
    const events$ = new Subject<unknown>();
    const out: MessageEvent[] = [];
    saga.identify(events$).subscribe((cmd) => out.push(cmd as MessageEvent));

    events$.next({ random: true });

    setImmediate(() => {
      expect(out).toHaveLength(0);
      done();
    });
  });
});
