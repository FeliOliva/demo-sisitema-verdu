const STORAGE_KEY = "mi_familia_demo_db_v1";

const state = {
  detalleTemporal: [],
};

function loadDb() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);

  const seed = {
    clientes: [],
    negocios: [],
    productos: [],
    ventas: [],
    counters: {
      cliente: 1,
      negocio: 1,
      producto: 1,
      venta: 1,
    },
  };
  saveDb(seed);
  return seed;
}

function saveDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function getDb() {
  return loadDb();
}

function nextId(db, entityName) {
  const id = db.counters[entityName];
  db.counters[entityName] += 1;
  return id;
}

function formatCurrency(value) {
  return `$${Number(value).toLocaleString("es-AR")}`;
}

function renderSelectOptions() {
  const db = getDb();
  const clienteSelects = [document.getElementById("negocio-cliente"), document.getElementById("venta-cliente")];
  const negocioSelect = document.getElementById("venta-negocio");
  const productoSelect = document.getElementById("venta-producto");

  clienteSelects.forEach((select) => {
    select.innerHTML = '<option value="">Selecciona cliente</option>';
    db.clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = String(cliente.id);
      option.textContent = `${cliente.nombre} ${cliente.apellido}`;
      select.appendChild(option);
    });
  });

  negocioSelect.innerHTML = '<option value="">Selecciona negocio</option>';
  db.negocios.forEach((negocio) => {
    const option = document.createElement("option");
    option.value = String(negocio.id);
    option.textContent = negocio.nombre;
    negocioSelect.appendChild(option);
  });

  productoSelect.innerHTML = '<option value="">Selecciona producto</option>';
  db.productos.forEach((producto) => {
    const option = document.createElement("option");
    option.value = String(producto.id);
    option.textContent = `${producto.nombre} (${formatCurrency(producto.precio)})`;
    productoSelect.appendChild(option);
  });
}

function renderListas() {
  const db = getDb();
  const clientesLista = document.getElementById("clientes-lista");
  const negociosLista = document.getElementById("negocios-lista");
  const productosLista = document.getElementById("productos-lista");

  clientesLista.innerHTML = "";
  db.clientes.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = `#${c.id} - ${c.nombre} ${c.apellido} (${c.telefono || "sin telefono"})`;
    clientesLista.appendChild(li);
  });

  negociosLista.innerHTML = "";
  db.negocios.forEach((n) => {
    const cliente = db.clientes.find((c) => c.id === n.clienteId);
    const li = document.createElement("li");
    li.textContent = `#${n.id} - ${n.nombre} | Cliente: ${
      cliente ? `${cliente.nombre} ${cliente.apellido}` : "N/A"
    }`;
    negociosLista.appendChild(li);
  });

  productosLista.innerHTML = "";
  db.productos.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `#${p.id} - ${p.nombre} (${p.medicion}) ${formatCurrency(p.precio)}`;
    productosLista.appendChild(li);
  });
}

function renderDetalleTemporal() {
  const detalle = document.getElementById("detalle-temporal");
  detalle.innerHTML = "";
  state.detalleTemporal.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.productoNombre} x ${item.cantidad} = ${formatCurrency(item.subTotal)}`;
    const remove = document.createElement("button");
    remove.textContent = "Quitar";
    remove.style.marginLeft = "8px";
    remove.addEventListener("click", () => {
      state.detalleTemporal.splice(index, 1);
      renderDetalleTemporal();
    });
    li.appendChild(remove);
    detalle.appendChild(li);
  });
}

function renderVentas() {
  const db = getDb();
  const tbody = document.querySelector("#ventas-tabla tbody");
  tbody.innerHTML = "";

  db.ventas.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.nroVenta}</td>
      <td>${v.clienteNombre}</td>
      <td>${v.negocioNombre}</td>
      <td>${formatCurrency(v.total)}</td>
      <td>${v.detalles.length}</td>
    `;
    tbody.appendChild(tr);
  });
}

function refreshAll() {
  renderSelectOptions();
  renderListas();
  renderDetalleTemporal();
  renderVentas();
}

function setupDemoAviso() {
  const overlay = document.getElementById("demo-aviso");
  const cerrarBtn = document.getElementById("cerrar-aviso");
  if (!overlay || !cerrarBtn) return;

  cerrarBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.classList.add("hidden");
    }
  });
}

function registerEventos() {
  const clienteForm = document.getElementById("cliente-form");
  const negocioForm = document.getElementById("negocio-form");
  const productoForm = document.getElementById("producto-form");
  const ventaForm = document.getElementById("venta-form");
  const confirmarVentaBtn = document.getElementById("confirmar-venta");
  const reiniciarBtn = document.getElementById("reiniciar-demo");

  clienteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("cliente-nombre").value.trim();
    const apellido = document.getElementById("cliente-apellido").value.trim();
    const telefono = document.getElementById("cliente-telefono").value.trim();
    if (!nombre || !apellido) return;

    const db = getDb();
    db.clientes.push({
      id: nextId(db, "cliente"),
      nombre,
      apellido,
      telefono,
      estado: 1,
      fechaCreacion: new Date().toISOString(),
    });
    saveDb(db);
    clienteForm.reset();
    refreshAll();
  });

  negocioForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const clienteId = Number(document.getElementById("negocio-cliente").value);
    const nombre = document.getElementById("negocio-nombre").value.trim();
    const direccion = document.getElementById("negocio-direccion").value.trim();
    if (!clienteId || !nombre) return;

    const db = getDb();
    db.negocios.push({
      id: nextId(db, "negocio"),
      nombre,
      direccion,
      clienteId,
      estado: 1,
      fechaCreacion: new Date().toISOString(),
    });
    saveDb(db);
    negocioForm.reset();
    refreshAll();
  });

  productoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("producto-nombre").value.trim();
    const precio = Number(document.getElementById("producto-precio").value);
    const medicion = document.getElementById("producto-medicion").value.trim();
    if (!nombre || !precio || !medicion) return;

    const db = getDb();
    db.productos.push({
      id: nextId(db, "producto"),
      nombre,
      precio,
      medicion,
      estado: 1,
      fechaCreacion: new Date().toISOString(),
    });
    saveDb(db);
    productoForm.reset();
    refreshAll();
  });

  ventaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const productoId = Number(document.getElementById("venta-producto").value);
    const cantidad = Number(document.getElementById("venta-cantidad").value);
    if (!productoId || !cantidad) return;

    const db = getDb();
    const producto = db.productos.find((p) => p.id === productoId);
    if (!producto) return;

    state.detalleTemporal.push({
      productoId: producto.id,
      productoNombre: producto.nombre,
      precio: producto.precio,
      cantidad,
      subTotal: producto.precio * cantidad,
    });
    renderDetalleTemporal();
  });

  confirmarVentaBtn.addEventListener("click", () => {
    const clienteId = Number(document.getElementById("venta-cliente").value);
    const negocioId = Number(document.getElementById("venta-negocio").value);
    if (!clienteId || !negocioId || state.detalleTemporal.length === 0) {
      alert("Selecciona cliente, negocio y agrega al menos un item.");
      return;
    }

    const db = getDb();
    const cliente = db.clientes.find((c) => c.id === clienteId);
    const negocio = db.negocios.find((n) => n.id === negocioId);
    if (!cliente || !negocio) return;

    const total = state.detalleTemporal.reduce((acc, item) => acc + item.subTotal, 0);
    const ventaId = nextId(db, "venta");
    db.ventas.push({
      id: ventaId,
      nroVenta: `V-${String(ventaId).padStart(4, "0")}`,
      clienteId,
      negocioId,
      clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
      negocioNombre: negocio.nombre,
      total,
      detalles: [...state.detalleTemporal],
      fechaCreacion: new Date().toISOString(),
      estado: 1,
    });
    saveDb(db);
    state.detalleTemporal = [];
    document.getElementById("venta-form").reset();
    refreshAll();
  });

  reiniciarBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state.detalleTemporal = [];
    refreshAll();
  });
}

function bootstrap() {
  loadDb();
  setupDemoAviso();
  registerEventos();
  refreshAll();
}

bootstrap();
