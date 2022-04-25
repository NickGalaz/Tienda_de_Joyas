const express = require('express')
// const joyas = require('./data/joyas.js')
const joyas = require('./data/joyasV2.js')
const app = express()
const port = 3000;
app.use(express.static("public"));


// CONSTANTES
const HATEOASV1 = () =>
  joyas.map((j) => {
    return {
      name: j.nombre,
      href: `http://localhost:3000/joya/${j.id}`,
    };
  });

const HATEOASV2 = () =>
  joyas.map((j) => {
    return {
      nombre: j.nombre,
      href: `http://localhost:3000/api/v2/joya/${j.id}`,
    };
  });

const joya = (id) => {
  return joyas.find((j) => j.id == id);
};

const filtroByCategoria = (categoria) => {
  return joyas.filter((j) => j.categoria === categoria);
};

const orderValues = (order) => {
  return order == "asc"
    ? joyas.sort((a, b) => (a.valor > b.valor ? 1 : -1))
    : order == "desc"
      ? joyas.sort((a, b) => (a.valor < b.valor ? 1 : -1))
      : false;
};

const fieldsSelect = (joya, fields) => {
  for (propiedad in joya) {
    if (!fields.includes(propiedad)) delete joya[propiedad];
  }
  return joya;
};

// RUTA RAIZ
app.get('/', (req, res) => {
  console.log('Lista de joyas: ', joyas);
  res.status(200).send(joyas);
});

// VERSION 1
app.get('/joyas', (req, res) => {
  res.status(200).send({
    joyas: HATEOASV1()
  });
});

app.get("/joya/:id", (req, res) => {
  const id = req.params.id;
  res.status(200).send(joya(id));
});

// VERSION 2
// CONSULTA DE TODAS LAS JOYAS, PAGINACION Y ORDEN POR PRECIO
// http://localhost:3000/api/v2/joyas
// http://localhost:3000/api/V2/joyas?page=2 
// http://localhost:3000/api/v2/joyas?values=asc
// http://localhost:3000/api/v2/joyas?values=desc
app.get("/api/v2/joyas", (req, res) => {
  const { values } = req.query;
  if (values == "asc") return res.send(orderValues("asc"));
  if (values == "desc") return res.send(orderValues("desc"));
  if (req.query.page) {
    const page = req.query.page;
    return res.status(200).send({ joyas: HATEOASV2().slice(page * 2 - 2, page * 2) });
  }
  res.status(200).send({
    joyas: HATEOASV2()
  });
});


// CONSULTA POR ID Y POR CAMPOS CON MENSAJE DE SI NO EXISTE PRODUCTO
// http://localhost:3000/api/v2/joya/22
// http://localhost:3000/api/v2/joya/3?fields=id,nombre,modelo,metal,categoria
app.get("/api/v2/joya/:id", (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;
  if (fields) return res.send({
    joya: fieldsSelect(JSON.parse(JSON.stringify(joya(id))),
      fields.split(","))
  });
  const joyita = joya(id)

  joyita
    ? res.send({
      joya: joyita
    })
    :
    res.status(404).send({
      error: "404 Not Found",
      message: "No existe joya con ese ID",
    });
});

// CONSULTA POR CATEGORIA
// http://localhost:3000/api/v2/category/aros
app.get("/api/v2/category/:cuerpo", (req, res) => {
  const { cuerpo } = req.params;
  const categoriaCuerpo = filtroByCategoria(cuerpo);
  res.status(200).send({
    cant: filtroByCategoria(cuerpo).length,
    joyas: categoriaCuerpo,
  });
});


app.listen(port, () => console.log('Iniciando en puerto: ' + port));