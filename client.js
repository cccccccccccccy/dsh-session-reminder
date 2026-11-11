/**
 * Session reminder — Client half.
 *
 * One global panel in the left sidebar: a bell with two separate badges —
 * a blue round badge for Sessions that are still running, and a green square
 * badge for Sessions that stopped while the user was elsewhere (the Session
 * Controller's `completionUnread` fact, the same fact behind the green "done"
 * dot on a Session row). The panel page lists both groups with matching
 * symbols and opens a Session on click.
 *
 * Data arrives through the framework's standard props:
 * `useSessions` (Host catalog rows) and `useSessionStatus` (independent UI
 * status per Session). Nothing here folds Session events itself.
 */
window.__ModuleLoader__.load({
  id: 'dsh-session-reminder',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'session-reminder';
    const PANEL_ID = 'session-reminder';
    const STYLE_KEY = 'dsh-session-reminder/reminder.css';

    const zh = {
      panel: '会话提醒',
      title: '会话提醒',
      subtitleClear: '当前没有需要留意的会话',
      statRunning: '{n} 个进行中',
      statFinished: '{n} 个已完成待查看',
      loading: '正在加载会话…',
      groupActive: '进行中',
      groupCompleted: '已完成，待查看',
      emptyActive: '没有正在运行的会话',
      emptyCompleted: '没有待查看的已完成会话',
      emptyHint: '当有会话正在运行，或有会话在你离开时完成，这里就会列出它们。',
      hint: '打开一个会话后，它的提醒会自动消失。',
      statusRunning: '进行中',
      statusApproval: '等待审批',
      statusQuestion: '等待回答',
      statusPlanReview: '计划待审',
      statusPending: '等待你的回应',
      statusCompleted: '已完成',
      statusIdle: '空闲',
      rowOpen: '打开会话：{title}',
      timeJustNow: '刚刚',
      timeMinutesAgo: '{n} 分钟前',
      timeHoursAgo: '{n} 小时前',
      timeDaysAgo: '{n} 天前',
    };

    const en = {
      panel: 'Session reminders',
      title: 'Session reminders',
      subtitleClear: 'Nothing needs your attention right now',
      statRunning: '{n} running',
      statFinished: '{n} finished, unread',
      loading: 'Loading sessions…',
      groupActive: 'Running',
      groupCompleted: 'Finished, unread',
      emptyActive: 'No session is running',
      emptyCompleted: 'No finished session awaits review',
      emptyHint: 'Sessions appear here while they run, and when they finish while you are elsewhere.',
      hint: 'Opening a session clears its reminder.',
      statusRunning: 'Running',
      statusApproval: 'Waiting for approval',
      statusQuestion: 'Waiting for your answer',
      statusPlanReview: 'Plan review',
      statusPending: 'Waiting for you',
      statusCompleted: 'Finished',
      statusIdle: 'Idle',
      rowOpen: 'Open session: {title}',
      timeJustNow: 'just now',
      timeMinutesAgo: '{n} min ago',
      timeHoursAgo: '{n} h ago',
      timeDaysAgo: '{n} d ago',
    };

    const CSS = `
.smr-page{display:flex;flex:1 1 auto;width:100%;min-width:0;height:100%;min-height:0;overflow:hidden;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.6}
.smr-scroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable}
.smr-content{max-width:860px;margin:0 auto;padding:0 clamp(20px,4vw,40px) 48px}
.smr-heading{padding-top:28px;margin-bottom:6px}
[data-platform=darwin] .smr-heading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.smr-heading h1{margin:0;font-size:20px;font-weight:500;line-height:28px}
.smr-subtitle{margin:6px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.smr-stats{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px}
.smr-stat{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:11px;background:color-mix(in oklab,var(--dsw-alias-label-primary) 6%,transparent);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:22px;font-variant-numeric:tabular-nums}
.smr-statMark{display:inline-flex;align-items:center;color:var(--dsw-alias-state-business-primary)}
.smr-statMark[data-kind=finished]{color:var(--dsw-alias-state-success-primary)}
.smr-groupMark{display:inline-flex;align-items:center;color:var(--dsw-alias-state-business-primary)}
.smr-groupMark[data-kind=finished]{color:var(--dsw-alias-state-success-primary)}
.smr-loading{padding:16px 2px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.smr-group{margin-top:22px}
.smr-groupHead{display:flex;align-items:center;gap:8px;margin:0 0 8px;padding:0 12px}
.smr-groupTitle{display:flex;align-items:center;gap:6px;margin:0;font-size:13px;font-weight:500;line-height:20px;color:var(--dsw-alias-label-secondary)}
.smr-count{box-sizing:border-box;min-width:18px;height:18px;padding:0 6px;border-radius:9px;background:color-mix(in oklab,var(--dsw-alias-label-primary) 8%,transparent);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px;font-variant-numeric:tabular-nums;text-align:center}
.smr-list{display:flex;flex-direction:column;gap:2px}
.smr-row{box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;margin:0;padding:10px 12px;border:0;border-radius:10px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.smr-row:hover{background:color-mix(in oklab,var(--dsw-alias-label-primary) 6%,transparent)}
.smr-row:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}
.smr-dot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-idle-primary)}
.smr-dot[data-tone=running]{background:var(--dsw-alias-state-business-primary)}
.smr-dot[data-tone=pending]{background:var(--dsw-alias-state-warn-primary)}
.smr-dot[data-tone=done]{background:var(--dsw-alias-state-success-primary)}
.smr-body{display:flex;flex:1;min-width:0;flex-direction:column;gap:2px}
.smr-rowTitle{overflow:hidden;font-size:14px;line-height:20px;white-space:nowrap;text-overflow:ellipsis}
.smr-rowMeta{overflow:hidden;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;white-space:nowrap;text-overflow:ellipsis}
.smr-chevron{flex:none;opacity:0;color:var(--dsw-alias-label-secondary);transition:opacity .12s}
.smr-row:hover .smr-chevron,.smr-row:focus-visible .smr-chevron{opacity:1}
.smr-empty{margin:0 12px;padding:14px 12px;border:1px dashed var(--dsw-alias-border-l1);border-radius:10px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.smr-emptyTop{margin:18px 0 0}
.smr-hint{margin:26px 12px 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.smr-glyph{position:relative;display:inline-flex;align-items:center;justify-content:center}
.smr-badge{position:absolute;right:-6px;box-sizing:border-box;min-width:13px;height:13px;padding:0 3px;color:#fff;font-size:9px;font-weight:600;line-height:13px;font-variant-numeric:tabular-nums;text-align:center;box-shadow:0 0 0 1.5px var(--dsw-specific-sidebar-fill)}
.smr-badge[data-kind=running]{top:-6px;border-radius:7px;background:var(--dsw-alias-state-business-primary)}
.smr-badge[data-kind=finished]{bottom:-6px;border-radius:4px;background:var(--dsw-alias-state-success-primary)}
.smr-glyph[data-solo=finished] .smr-badge[data-kind=finished]{top:-6px;bottom:auto}
`;

    const EMPTY_HOOK = () => 0;

    /** Sessions still running (a pending interaction keeps its Session running). */
    function countActive(statuses) {
      let total = 0;
      for (const status of statuses.values()) {
        if (status.running === true || status.pendingInteraction !== undefined) total += 1;
      }
      return total;
    }

    /** Sessions that stopped while the main view was elsewhere and stay unread. */
    function countCompleted(statuses) {
      let total = 0;
      for (const status of statuses.values()) {
        if (status.running === true || status.pendingInteraction !== undefined) continue;
        if (status.completionUnread === true) total += 1;
      }
      return total;
    }

    function isActive(status) {
      return status.running === true || status.pendingInteraction !== undefined;
    }

    function statusPresentation(status, t) {
      const pending = status.pendingInteraction;
      if (pending !== undefined) {
        if (pending.kind === 'approval') return { tone: 'pending', label: t('statusApproval') };
        if (pending.kind === 'question') return { tone: 'pending', label: t('statusQuestion') };
        if (pending.kind === 'plan-review') return { tone: 'pending', label: t('statusPlanReview') };
        return { tone: 'pending', label: t('statusPending') };
      }
      if (status.running === true) return { tone: 'running', label: t('statusRunning') };
      if (status.completionUnread === true) return { tone: 'done', label: t('statusCompleted') };
      return { tone: 'idle', label: t('statusIdle') };
    }

    function folderName(cwd) {
      if (typeof cwd !== 'string' || cwd.length === 0) return '';
      const parts = cwd.split(/[\\/]+/).filter((part) => part.length > 0);
      return parts.length === 0 ? cwd : parts[parts.length - 1];
    }

    function relativeTime(t, value, now) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '';
      const elapsed = Math.max(0, now - value);
      if (elapsed < 45000) return t('timeJustNow');
      const minutes = Math.floor(elapsed / 60000);
      if (minutes < 60) return t('timeMinutesAgo', { n: minutes });
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return t('timeHoursAgo', { n: hours });
      const days = Math.floor(hours / 24);
      if (days < 7) return t('timeDaysAgo', { n: days });
      try {
        return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
      } catch {
        return '';
      }
    }

    /** Derive the two reminder groups from the catalog rows and their UI status. */
    function deriveRows(list, statuses) {
      const running = [];
      const finished = [];
      const ids = Array.isArray(list.ids) ? list.ids : [];
      for (const id of ids) {
        const summary = list.byId[id];
        if (summary === undefined || summary.blank === true) continue;
        const status = statuses.get(id);
        if (status === undefined) continue;
        const row = {
          id,
          title: typeof summary.displayTitle === 'string' && summary.displayTitle.length > 0 ? summary.displayTitle : id,
          cwd: summary.cwd,
          updatedAt: summary.updatedAt,
          status,
        };
        if (isActive(status)) running.push(row);
        else if (status.completionUnread === true) finished.push(row);
      }
      const newestFirst = (left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0);
      running.sort(newestFirst);
      finished.sort(newestFirst);
      return { running, finished };
    }

    function Chevron() {
      return h(
        'svg',
        {
          className: 'smr-chevron',
          width: 14,
          height: 14,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
        },
        h('path', {
          d: 'M6 3.5 10.5 8 6 12.5',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    function ReminderRow({ row, t, openSession, now }) {
      const presentation = statusPresentation(row.status, t);
      const meta = [presentation.label];
      const folder = folderName(row.cwd);
      if (folder.length > 0) meta.push(folder);
      const time = relativeTime(t, row.updatedAt, now);
      if (time.length > 0) meta.push(time);
      return h(
        'button',
        {
          type: 'button',
          className: 'smr-row',
          title: typeof row.cwd === 'string' ? row.cwd : undefined,
          'aria-label': t('rowOpen', { title: row.title }),
          onClick: () => openSession(row.id),
        },
        h('span', { className: 'smr-dot', 'data-tone': presentation.tone, 'aria-hidden': 'true' }),
        h(
          'span',
          { className: 'smr-body' },
          h('span', { className: 'smr-rowTitle' }, row.title),
          h('span', { className: 'smr-rowMeta' }, meta.join(' · ')),
        ),
        Chevron(),
      );
    }

    /** Play mark: a Session is running. */
    function MarkRunning() {
      return h(
        'svg',
        { width: 10, height: 10, viewBox: '0 0 10 10', 'aria-hidden': 'true', focusable: 'false' },
        h('path', { d: 'M3 1.9 8.2 5 3 8.1Z', fill: 'currentColor' }),
      );
    }

    /** Check mark: a Session finished and still awaits review. */
    function MarkFinished() {
      return h(
        'svg',
        { width: 10, height: 10, viewBox: '0 0 10 10', 'aria-hidden': 'true', focusable: 'false' },
        h('path', {
          d: 'm1.8 5.2 2.1 2.1 4.3-4.6',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    function ReminderGroup({ kind, heading, count, rows, emptyText, t, openSession, now }) {
      return h(
        'section',
        { className: 'smr-group', 'aria-label': heading },
        h(
          'div',
          { className: 'smr-groupHead' },
          h(
            'h2',
            { className: 'smr-groupTitle' },
            h('span', { className: 'smr-groupMark', 'data-kind': kind }, kind === 'running' ? MarkRunning() : MarkFinished()),
            heading,
          ),
          count > 0 ? h('span', { className: 'smr-count' }, String(count)) : null,
        ),
        rows.length > 0
          ? h(
              'div',
              { className: 'smr-list' },
              rows.map((row) => h(ReminderRow, { key: row.id, row, t, openSession, now })),
            )
          : h('div', { className: 'smr-empty' }, emptyText),
      );
    }

    /** The sidebar panel page: running Sessions first, then unread completions. */
    function ReminderPage(props) {
      const { t, openSession } = props;
      const list = props.useSessions((state) => state);
      const statuses = props.useSessionStatus((snapshot) => snapshot);
      const [now, setNow] = React.useState(() => Date.now());

      React.useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 30000);
        return () => window.clearInterval(timer);
      }, []);

      const groups = React.useMemo(() => deriveRows(list, statuses), [list, statuses]);
      const running = groups.running;
      const finished = groups.finished;
      const loading = list.phase !== 'ready' && running.length === 0 && finished.length === 0;
      const hasRows = running.length + finished.length > 0;

      return h(
        'section',
        { className: 'smr-page', 'aria-label': t('title') },
        h(
          'div',
          { className: 'smr-scroll' },
          h(
            'div',
            { className: 'smr-content' },
            h(
              'header',
              { className: 'smr-heading' },
              h('h1', null, t('title')),
              hasRows
                ? h(
                    'div',
                    { className: 'smr-stats' },
                    h(
                      'span',
                      { className: 'smr-stat' },
                      h('span', { className: 'smr-statMark', 'data-kind': 'running' }, MarkRunning()),
                      t('statRunning', { n: running.length }),
                    ),
                    h(
                      'span',
                      { className: 'smr-stat' },
                      h('span', { className: 'smr-statMark', 'data-kind': 'finished' }, MarkFinished()),
                      t('statFinished', { n: finished.length }),
                    ),
                  )
                : h('p', { className: 'smr-subtitle' }, t('subtitleClear')),
            ),
            loading
              ? h('div', { className: 'smr-loading' }, t('loading'))
              : running.length + finished.length === 0
                ? h('div', { className: 'smr-empty smr-emptyTop' }, t('emptyHint'))
                : [
                    h(ReminderGroup, {
                      key: 'running',
                      kind: 'running',
                      heading: t('groupActive'),
                      count: running.length,
                      rows: running,
                      emptyText: t('emptyActive'),
                      t,
                      openSession,
                      now,
                    }),
                    h(ReminderGroup, {
                      key: 'finished',
                      kind: 'finished',
                      heading: t('groupCompleted'),
                      count: finished.length,
                      rows: finished,
                      emptyText: t('emptyCompleted'),
                      t,
                      openSession,
                      now,
                    }),
                    h('p', { key: 'hint', className: 'smr-hint' }, t('hint')),
                  ],
          ),
        ),
      );
    }

    /** The sidebar bell: native panel row owns the click; this is its glyph. */
    function ReminderIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 18;
      const useStatus = typeof props.useSessionStatus === 'function' ? props.useSessionStatus : EMPTY_HOOK;
      const active = useStatus(countActive);
      const completed = useStatus(countCompleted);
      const badges = [];
      if (active > 0) {
        badges.push(
          h(
            'span',
            { key: 'running', className: 'smr-badge', 'data-kind': 'running' },
            active > 9 ? '9+' : String(active),
          ),
        );
      }
      if (completed > 0) {
        badges.push(
          h(
            'span',
            { key: 'finished', className: 'smr-badge', 'data-kind': 'finished' },
            completed > 9 ? '9+' : String(completed),
          ),
        );
      }
      return h(
        'span',
        {
          className: 'smr-glyph',
          style: { width: size, height: size },
          'aria-hidden': 'true',
          'data-solo': completed > 0 && active === 0 ? 'finished' : undefined,
        },
        h(
          'svg',
          { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', focusable: 'false' },
          h('path', {
            d: 'M8 2.1a3.8 3.8 0 0 0-3.8 3.8v2.2L3 10.4c-.3.5.1 1.1.7 1.1h8.6c.6 0 1-.6.7-1.1l-1.2-2.3V5.9A3.8 3.8 0 0 0 8 2.1Z',
            stroke: 'currentColor',
            strokeWidth: 1.2,
            strokeLinejoin: 'round',
          }),
          h('path', {
            d: 'M6.5 12.4a1.55 1.55 0 0 0 3 0',
            stroke: 'currentColor',
            strokeWidth: 1.2,
            strokeLinecap: 'round',
          }),
        ),
        badges,
      );
    }

    return {
      inject: ['slots', 'locale', 'uiWorkspace'],
      apply(ctx) {
        const t = ctx.locale.bind(NS);

        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'session-reminder: dictionaries');

        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.pluginCss = STYLE_KEY;
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        }, 'session-reminder: styles');

        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: PANEL_ID,
              locale: NS,
              inject: () => ({
                openSession: (sessionId) => {
                  ctx.get('uiWorkspace')?.openSession(sessionId);
                },
              }),
            },
            ReminderPage,
          ),
        );

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: PANEL_ID,
              order: 20,
              locale: NS,
              label: () => t('panel'),
            },
            ReminderIcon,
          ),
        );
      },
    };
  },
});
