import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB4YkmcUtBtC9uA73k3C3SifQwafcDcEpU",
  authDomain: "a5hevm.firebaseapp.com",
  projectId: "a5hevm",
  storageBucket: "a5hevm.firebasestorage.app",
  messagingSenderId: "794334044524",
  appId: "1:794334044524:web:07dad4c77bf3b5b636d349",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia al contenedor principal
const appContainer = document.getElementById("app");

// Renderizar la pantalla de inicio de sesión
function renderLoginScreen() {
  appContainer.innerHTML = `
    <header>
      <h1>Farmatotal - Inicio de Sesión</h1>
    </header>
    <div class="container">
      <label>Correo Electrónico</label>
      <input type="email" id="email" placeholder="example@mail.com">
      <label>Contraseña</label>
      <input type="password" id="password" placeholder="********">
      <button class="button" onclick="login()">Iniciar Sesión</button>
    </div>
  `;
}
window.renderLoginScreen = renderLoginScreen;

// Función de inicio de sesión
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email === "admin@example.com" && password === "admin123") {
    alert("Inicio de sesión exitoso.");
    renderDashboard();
  } else {
    alert("Correo o contraseña incorrectos. Inténtalo de nuevo.");
  }
}
window.login = login;

// Renderizar el dashboard principal
async function renderDashboard() {
  const products = await fetchProducts();
  const orders = await fetchOrders();

  const productLabels = products.map((product) => product.name);
  const productQuantities = products.map((product) => product.quantity);

  const orderLabels = orders.map((order) => order.productName);
  const orderQuantities = orders.map((order) => order.quantity);

  appContainer.innerHTML = `
    <header>
      <h1>Farmatotal - Dashboard</h1>
    </header>
    <div class="container">
      <h2>Bienvenido a Farmatotal</h2>
      <div>
        <canvas id="productChart"></canvas>
        <canvas id="orderChart"></canvas>
      </div>
      <button class="button" onclick="renderCatalog()">Ver Catálogo</button>
      <button class="button" onclick="renderOrderHistory()">Historial de Pedidos</button>
      <button class="button" onclick="renderProfile()">Perfil del Usuario</button>
    </div>
  `;

  renderPieChart("productChart", productLabels, productQuantities, "Inventario de Productos");
  renderPieChart("orderChart", orderLabels, orderQuantities, "Historial de Pedidos");
}
window.renderDashboard = renderDashboard;

// Renderizar un gráfico circular
function renderPieChart(canvasId, labels, data, title) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: title,
        },
      },
    },
  });
}

// Renderizar el catálogo de productos
async function renderCatalog() {
  try {
    const products = await fetchProducts();
    appContainer.innerHTML = `
      <header>
        <h1>Catálogo de Productos</h1>
      </header>
      <div class="container">
        ${products
          .map(
            (product) => `
          <div class="card">
            <h3>${product.name}</h3>
            <p>Precio: $${product.price}</p>
            <p>Cantidad Disponible: ${product.quantity}</p>
            <button class="button" onclick="addToCart('${product.id}', '${product.name}', ${product.price})">Agregar al Carrito</button>

            <button class="button" onclick="renderEditProductForm('${product.id}', '${product.name}', ${product.price}, ${product.quantity})">Editar</button>
            <button class="button" onclick="deleteProduct('${product.id}')">Eliminar</button>
          </div>
        `
          )
          .join("")}
        <button class="button" onclick="renderAddProductForm()">Agregar Producto</button>
        <button class="button" onclick="renderDashboard()">Volver</button>
      </div>
    `;
  } catch (error) {
    console.error("Error al renderizar el catálogo:", error);
    appContainer.innerHTML = `
      <header>
        <h1>Catálogo de Productos</h1>
      </header>
      <div class="container">
        <p>Hubo un error al cargar el catálogo. Inténtalo más tarde.</p>
        <button class="button" onclick="renderDashboard()">Volver</button>
      </div>
    `;
  }
}
window.renderCatalog = renderCatalog;

// Renderizar formulario para agregar producto
function renderAddProductForm() {
  appContainer.innerHTML = `
    <header>
      <h1>Agregar Producto</h1>
    </header>
    <div class="container">
      <label>Nombre del Producto:</label>
      <input type="text" id="productName" placeholder="Nombre del producto">
      <label>Precio:</label>
      <input type="number" id="productPrice" placeholder="Precio">
      <label>Cantidad:</label>
      <input type="number" id="productQuantity" placeholder="Cantidad">
      <button class="button" onclick="addProduct()">Guardar</button>
      <button class="button" onclick="renderCatalog()">Cancelar</button>
    </div>
  `;
}
window.renderAddProductForm = renderAddProductForm;

// Función para agregar un producto
async function addProduct() {
  const name = document.getElementById("productName").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const quantity = parseInt(document.getElementById("productQuantity").value);

  if (!name || !price || !quantity) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    await addDoc(collection(db, "products"), { name, price, quantity });
    alert("Producto agregado correctamente.");
    renderCatalog();
  } catch (error) {
    console.error("Error al agregar producto:", error);
    alert("Error al agregar el producto.");
  }
}
window.addProduct = addProduct;

// Renderizar formulario para editar producto
function renderEditProductForm(productId, name, price, quantity) {
  appContainer.innerHTML = `
    <header>
      <h1>Editar Producto</h1>
    </header>
    <div class="container">
      <label>Nombre del Producto:</label>
      <input type="text" id="productName" value="${name}">
      <label>Precio:</label>
      <input type="number" id="productPrice" value="${price}">
      <label>Cantidad:</label>
      <input type="number" id="productQuantity" value="${quantity}">
      <button class="button" onclick="editProduct('${productId}')">Guardar</button>
      <button class="button" onclick="renderCatalog()">Cancelar</button>
    </div>
  `;
}
window.renderEditProductForm = renderEditProductForm;

// Función para editar un producto
async function editProduct(productId) {
  const name = document.getElementById("productName").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const quantity = parseInt(document.getElementById("productQuantity").value);

  if (!name || !price || !quantity) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { name, price, quantity });
    alert("Producto actualizado correctamente.");
    renderCatalog();
  } catch (error) {
    console.error("Error al editar producto:", error);
    alert("Error al actualizar el producto.");
  }
}
window.editProduct = editProduct;

// Función para eliminar un producto
async function deleteProduct(productId) {
  try {
    await deleteDoc(doc(db, "products", productId));
    alert("Producto eliminado correctamente.");
    renderCatalog(); // Actualiza el catálogo después de eliminar
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    alert("No se pudo eliminar el producto.");
  }
}
window.deleteProduct = deleteProduct;


// Renderizar el historial de pedidos
async function renderOrderHistory() {
  try {
    const orders = await fetchOrders();
    appContainer.innerHTML = `
      <header>
        <h1>Historial de Pedidos</h1>
      </header>
      <div class="container">
        ${orders
          .map(
            (order) => `
          <div class="card">
            <h3>${order.productName}</h3>
            <p>Precio: $${order.productPrice}</p>
            <p>Cantidad: ${order.quantity}</p>
            <p>Fecha: ${new Date(order.date).toLocaleString()}</p>
          </div>
        `
          )
          .join("")}
        <button class="button" onclick="renderDashboard()">Volver</button>
      </div>
    `;
  } catch (error) {
    console.error("Error al renderizar el historial de pedidos:", error);
    appContainer.innerHTML = `
      <header>
        <h1>Historial de Pedidos</h1>
      </header>
      <div class="container">
        <p>Hubo un error al cargar el historial. Inténtalo más tarde.</p>
        <button class="button" onclick="renderDashboard()">Volver</button>
      </div>
    `;
  }
}
window.renderOrderHistory = renderOrderHistory;


// Función para obtener productos
async function fetchProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Función para obtener pedidos
async function fetchOrders() {
  const querySnapshot = await getDocs(collection(db, "orders"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
// Función para agregar al carrito y registrar en el historial de pedidos
async function addToCart(productId, productName, productPrice) {
  try {
    const order = {
      productId,
      productName,
      productPrice,
      quantity: 1,
      date: new Date().toISOString(),
    };
    await addDoc(collection(db, "orders"), order); // Registra el pedido en Firestore
    alert("Producto agregado al carrito y registrado en el historial de pedidos.");
    renderOrderHistory(); // Actualiza el historial de pedidos
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    alert("No se pudo agregar el producto al carrito.");
  }
}
window.addToCart = addToCart;


// Renderizar perfil del usuario
function renderProfile() {
  appContainer.innerHTML = `
    <header>
      <h1>Perfil del Usuario</h1>
    </header>
    <div class="container">
      <div class="card">
        <h3>Hector Velazquez</h3>
        <p>Correo: Hector.Velazquez@example.com</p>
        <p>Teléfono: +52 123 456 7890</p>
        <button class="button" onclick="renderLoginScreen()">Cerrar Sesión</button>
        <button class="button" onclick="renderDashboard()">Volver</button>

      </div>
    </div>
  `;
}
window.renderProfile = renderProfile;

// Inicializar aplicación
renderLoginScreen();
