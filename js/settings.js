import { state, save, exportJSON, importJSON } from './storage.js';
import { $ } from './util.js';

export function render(root) {
  root.innerHTML = `
    <h1>Backup</h1>
    <div class="card">
      <p class="muted" style="margin-bottom:12px">Your data lives only in this browser. Download a backup now and then (and before switching phones).</p>
      <button class="btn block" id="export">Download backup</button>
      <label style="margin-top:16px">Restore from backup file</label>
      <input type="file" id="import" accept=".json,application/json">
      <p class="muted" id="msg"></p>
    </div>
    <div class="card">
      <button class="btn danger block" id="reset-stats">Reset statistics only</button>
    </div>`;

  $('#export', root).onclick = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `georgian-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  $('#import', root).onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      importJSON(await file.text());
      $('#msg', root).textContent = 'Restored ✓';
    } catch (err) {
      $('#msg', root).textContent = 'Failed: ' + err.message;
    }
  };
  $('#reset-stats', root).onclick = () => {
    if (!confirm('Reset all progress and statistics? Words are kept.')) return;
    state.progress = {};
    state.history = {};
    save();
  };
}
