export function createMenu({
  onStart = () => {},
  onSave = () => {},
  onLoad = () => {},
} = {}) {
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "10",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#182638dd,#263b4bdd)",
    color: "#fff2d8",
    font: "16px Arial,sans-serif",
  });
  overlay.innerHTML =
    '<div style="width:min(440px,85vw);padding:36px;background:#17232bee;border:1px solid #f2bd78;text-align:center;box-shadow:0 18px 70px #10182099"><div style="font-size:12px;letter-spacing:.25em;color:#f3c47d">KOTA DI UJUNG CAHAYA</div><h1 style="font-size:42px;letter-spacing:.12em;margin:14px 0">PULAU SENJA</h1><p style="color:#e7d7c3">Malam panjang menanti Nadia di pesisir.</p><div style="display:grid;gap:10px;margin-top:25px"><button data-action="start">MULAI JELAJAH</button><button data-action="load">LANJUTKAN SIMPANAN</button><button data-action="save">SIMPAN PERMAINAN</button><button data-action="close">KEMBALI</button></div></div>';
  const css = document.createElement("style");
  css.textContent =
    "#ps-menu button{padding:12px;border:1px solid #72808a;background:#253440;color:#fff2d8;letter-spacing:.12em;cursor:pointer}#ps-menu button:hover{background:#765d45;border-color:#f3c47d}";
  document.head.append(css);
  overlay.id = "ps-menu";
  overlay.addEventListener("click", (event) => {
    const action = event.target.closest("button")?.dataset.action;
    if (action === "start") {
      overlay.remove();
      onStart();
    }
    if (action === "close") overlay.remove();
    if (action === "save") onSave();
    if (action === "load") {
      const loaded = onLoad();
      if (loaded) overlay.remove();
    }
  });
  document.body.append(overlay);
  return { close: () => overlay.remove(), element: overlay };
}
export default createMenu;
