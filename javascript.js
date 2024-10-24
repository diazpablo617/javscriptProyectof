class Usuario {
    constructor(nombre, email) {
        this.nombre = nombre;
        this.email = email;
    }

    guardar() {
        localStorage.setItem('usuario', JSON.stringify(this));
    }

    static recuperar() {
        const usuarioGuardado = localStorage.getItem('usuario');
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    }

    static mostrarResultado() {
        const usuario = Usuario.recuperar();
        if (usuario) {
            document.getElementById('resultado').innerText = `Nombre: ${usuario.nombre}, Email: ${usuario.email}`;
        }
    }
}

document.getElementById('miFormulario').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;

    // crear nuevo usuario Usuario
    const usuario = new Usuario(nombre, email);
    usuario.guardar(); // guardar en localStorage

    // mostrar  datos
    Usuario.mostrarResultado();
});

// cargar y mostrar datos al iniciar
window.addEventListener('load', Usuario.mostrarResultado);

let totalGastos = 0; 
let resumenCompras = [];
let contadorId = 1; 

// generar ID único
const generarIdUnico = () => {
    return `compra-${contadorId++}`;
};

const actualizarTotal = () => {
    const resumenCarrito = document.getElementById("resumenCarrito");
    const resumen = resumenCompras.map(compra => compra.descripcion).join('\n');
    resumenCarrito.textContent = `Resumen de Compras:\n${resumen}`;
};

const mostrarTotalFinal = () => {
    const confirmarCom = document.getElementById("confirmarCom");
    confirmarCom.textContent = `Usted ha comprado bebidas por un total de $${totalGastos}---------->>>>>>GRACIAS POR SU COMPRA`;
};

// función para agregar producto con botón eliminar
const agregarProductoAlResumen = (compra, listaId) => {
    const usuario = Usuario.recuperar(); // recupera el usuario
    const comprasList = document.getElementById(listaId);
    const nuevaCompra = document.createElement("li");
    const eliminarBtn = document.createElement("button");

    eliminarBtn.textContent = "Eliminar";
    eliminarBtn.addEventListener("click", () => {
        eliminarCompra(nuevaCompra, compra.id, compra.gasto);
        Swal.fire("Se elimino el producto del carrito");
    });

    // incluye el nombre y email en la descripción
    nuevaCompra.textContent = `Comprado por: ${usuario.nombre} (${usuario.email}) - ${compra.descripcion}`;
    nuevaCompra.appendChild(eliminarBtn);
    comprasList.appendChild(nuevaCompra);

    totalGastos += compra.gasto; 
    resumenCompras.push(compra); 
    actualizarTotal(); // actualizar resumen
};

// función para eliminar un producto específico
const eliminarCompra = (elemento, id, gasto) => {
    elemento.remove(); 
    totalGastos -= gasto; // restar el gasto al total
    resumenCompras = resumenCompras.filter(compra => compra.id !== id); // eliminar solo ese producto del resumen
    actualizarTotal(); 
}

// función para agregar producto desde la tarjeta
const agregarCompras = (tipo, precio, cantidadInputId, listaId) => {
    const cantidadInput = document.getElementById(cantidadInputId);
    const cantidad = parseFloat(cantidadInput.value);
    
    if (cantidad > 0) {
        const gasto = cantidad * precio;
        const compraDescripcion = `${tipo}: ${cantidad} x $${precio} = $${gasto}`;
        const id = generarIdUnico(); // asigna un ID único
        agregarProductoAlResumen({ descripcion: compraDescripcion, gasto: gasto, id: id }, listaId);
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Producto agregado",
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            title: "ERROR",
            text: "Ingresar cantidad valida",
            icon: "error"
          });
    }
}

// cargar productos desde el JSON
const productos = [];
const url = "lista.json";

function mostrarProductos() {
    const container = document.getElementById("productos");
    container.innerHTML = "";
    productos.forEach(e => {
        const card = document.createElement("div");
        card.className = "card"; // clase para estilos

        // contenido de tarjeta
        card.innerHTML = `<h3>${e.nombre}</h3>
            <p>Precio: $${e.precio}</p>
            <img src="${e.imagen}" alt="${e.nombre}" style="width: 100%;" />
            <form id="form-${e.id}">
                <label for="cantidad-${e.id}">Cantidad:</label>
                <input type="number" id="cantidad-${e.id}" name="cantidad"  value="1" />
                <button type="submit">Agregar</button>
            </form>`;

        // agregar el evento de submit al formulario
        const form = card.querySelector(`form#form-${e.id}`);
        form.addEventListener("submit", (event) => {
            event.preventDefault(); // prevenir el envío del formulario
            agregarCompras(e.nombre, e.precio, `cantidad-${e.id}`, 'comprasList');
            
        });

        container.appendChild(card);
    });
}

fetch(url).then(function(respuesta) {
    return respuesta.json();
}).then(rta => {
    rta.forEach(e => productos.push(e));
    mostrarProductos();
}).catch(error => {
    console.error("Hubo un problema con la carga de productos:", error);
});    

// funcionalidad para el botón de confirmar compra
document.getElementById('btnConfirmarCompra').addEventListener("click", (event) => {
    event.preventDefault();
    mostrarTotalFinal(); // Muestra el total
    Swal.fire({
        title: "Felicidades",
        text: "Su compra se realizo con exito!",
        icon: "success"
        
    });
});



