# dsh-session-reminder

Two counters in the DeepSeek Harness left sidebar, so you can tell at a glance what is still running and what finished while you were somewhere else.

| Badge | Position on the bell | Meaning |
|---|---|---|
| 🔵 Blue circle | top-right | Sessions currently running (including one waiting for approval, an answer, or plan review) |
| 🟩 Green rounded square | bottom-right | Sessions that finished and are still unread |

A zero count hides its badge; counts above 9 show `9+`. When nothing is running but finished sessions are waiting, the green badge moves to the top-right so it is not hidden under an empty slot.

Clicking the bell opens the reminder page: a blue `▶ N 个进行中` / `▶ N running` group and a green `✓ N 个已完成待查看` / `✓ N finished, unread` group, each row with its status dot, relative finish time and a click target that opens that session.

## What counts

- **Running** — the host reports the Session as running, or it is parked on a pending interaction (approval, question, plan review).
- **Finished, unread** — the host's own completion-unread fact, the same one behind the green "done" dot on a Session row. The Session you are currently viewing does not count, so answering in a session that finishes under you never leaves a stale reminder.
- **Clearing** — opening a finished session marks it read and the green count drops by one.

## Install

From GitHub (no build step, no dependencies):

```sh
dsh plugin --profile web add github:cccccccccccccy/dsh-session-reminder
```

Then restart `dsh web`. The plugin is a bundle, and bundles are mounted at boot, so a page refresh on an already-running host is not enough.

Once published to npm, the shorter form is:

```sh
dsh plugin --profile web add dsh-session-reminder
```

Uninstall:

```sh
dsh plugin --profile web remove dsh-session-reminder
```

and restart.

## Privacy

The plugin reads only the Session catalog and per-Session status the host already provides to its own sidebar. It makes no network requests, writes no files, and collects nothing. All of its code is in `index.js` (a no-op host half) and `client.js` (the sidebar UI), both plain readable JavaScript.

## Compatibility

Tested against DSH Web `0.2.1-rc.2`; `engines.dsh` declares `>=0.2.1-rc.1 <0.3.0`. The client half uses the host's client-slot API (`sidebar.panellist`, `main`) and locale service, so a host release that renames those slots would need a matching update here.

## 中文说明

左侧栏铃铛上的两枚徽标：**蓝色圆形**是正在进行中的会话数（含等待审批 / 等待回答 / 计划待审），**绿色圆角方形**是已完成但还没打开查看的会话数。数量为 0 时徽标隐藏，超过 9 显示 `9+`；只剩已完成会话时，绿色徽标会移到右上角。

点铃铛打开提醒页，按「进行中」和「已完成，待查看」分组列出会话，点任意一行直接打开该会话；打开后对应提醒自动清除。你正停留在某个会话里时它结束，不算未读提醒。

安装（GitHub 直装，无需构建）：

```sh
dsh plugin --profile web add github:cccccccccccccy/dsh-session-reminder
```

装完需要**重启 `dsh web`**（bundle 在启动时挂载，刷新页面不够）。卸载用 `dsh plugin --profile web remove dsh-session-reminder`，同样要重启。

插件只读取宿主已经提供给侧栏的会话目录与状态，不联网、不写文件、不上报任何数据。兼容性：在 DSH Web `0.2.1-rc.2` 上验证。

## License

MIT
