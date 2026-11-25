const VALID_VOTER_IDS = ["VOTER001", "VOTER002", "VOTER003", "VOTER004", "VOTER005"];
const CANDIDATES = ["Anita Rao", "Vikram Sethi", "Neha Kapoor"];
const STORAGE_KEY = "verifiableVotingDemoLedger";

function getLedger() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveLedger(ledger) { localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger)); }
function makeReceipt() {
  return "RCP-" + crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
}
async function hashText(value) {
  if (!crypto.subtle) return "DEMO-" + btoa(value).replace(/[^A-Z0-9]/gi, "").slice(0, 24);
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = "message " + type;
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
}

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab === button));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("hidden", panel.id !== button.dataset.tab));
    if (button.dataset.tab !== "voter") renderDashboards();
  });
});

document.getElementById("voteForm").addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.getElementById("voteMessage");
  const voterId = document.getElementById("voterId").value.trim().toUpperCase();
  const candidate = document.querySelector('input[name="candidate"]:checked')?.value;
  if (!VALID_VOTER_IDS.includes(voterId)) {
    showMessage(message, "Invalid demo ID. Use VOTER001 to VOTER005.", "error"); return;
  }
  const ledger = getLedger();
  if (ledger.some(vote => vote.voterId === voterId)) {
    showMessage(message, "This demo voter ID has already voted. Each ID can vote only once.", "error"); return;
  }
  if (!CANDIDATES.includes(candidate)) {
    showMessage(message, "Please select a candidate.", "error"); return;
  }
  const receipt = makeReceipt();
  const timestamp = new Date().toISOString();
  const hash = await hashText([receipt, candidate, timestamp].join("|"));
  ledger.push({ voterId, candidate, receipt, hash, timestamp });
  saveLedger(ledger);
  showMessage(message, `Your vote has been recorded. Save this receipt code: ${receipt}`, "success");
  document.getElementById("receiptCode").value = receipt;
  document.getElementById("voteForm").reset();
});

function verifyReceipt(code) {
  return getLedger().find(vote => vote.receipt.toUpperCase() === code.trim().toUpperCase());
}
document.getElementById("receiptForm").addEventListener("submit", event => {
  event.preventDefault();
  const vote = verifyReceipt(document.getElementById("receiptCode").value);
  const target = document.getElementById("receiptMessage");
  if (!vote) { showMessage(target, "Receipt not found in this browser's demo ledger.", "error"); return; }
  showMessage(target, `Verified: this receipt is present in the ledger. Candidate: ${vote.candidate}. Hash: ${vote.hash}`, "success");
});
document.getElementById("auditForm").addEventListener("submit", event => {
  event.preventDefault();
  const vote = verifyReceipt(document.getElementById("auditCode").value);
  const target = document.getElementById("auditMessage");
  if (!vote) { showMessage(target, "Receipt not found. No matching record exists in this demo ledger.", "error"); return; }
  showMessage(target, `Receipt verified. Candidate: ${vote.candidate}. Record hash: ${vote.hash}`, "success");
});
document.getElementById("refreshOfficials").addEventListener("click", renderDashboards);

function renderDashboards() {
  const ledger = getLedger();
  const counts = Object.fromEntries(CANDIDATES.map(name => [name, 0]));
  ledger.forEach(vote => { if (counts[vote.candidate] !== undefined) counts[vote.candidate]++; });
  document.getElementById("totalVotes").textContent = ledger.length;
  document.getElementById("remainingVotes").textContent = VALID_VOTER_IDS.length - ledger.length;
  const max = Math.max(1, ...Object.values(counts));
  document.getElementById("results").innerHTML = CANDIDATES.map(name => `
    <div class="result-row">
      <span>${escapeHTML(name)}</span>
      <div class="bar"><div class="bar-fill" style="width:${counts[name] / max * 100}%"></div></div>
      <strong>${counts[name]}</strong>
    </div>`).join("");
  const rows = ledger.length ? ledger.map((vote, index) => `
    <tr><td>${index + 1}</td><td>${escapeHTML(vote.candidate)}</td><td class="hash">${escapeHTML(vote.hash.slice(0, 20))}…</td><td>${new Date(vote.timestamp).toLocaleString()}</td></tr>`).join("")
    : '<tr><td colspan="4" class="empty">No votes recorded yet.</td></tr>';
  document.getElementById("officialLedger").innerHTML = rows;
  document.getElementById("auditLedger").innerHTML = rows;
  document.getElementById("ledgerCount").textContent = `${ledger.length} record${ledger.length === 1 ? "" : "s"}`;
}
renderDashboards();
