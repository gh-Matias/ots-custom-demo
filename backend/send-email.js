const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

// Configuración del correo
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: "TU_CORREO@bch.bancochile.cl",
    pass: "TU_PASSWORD"
  }
})

app.post('/api/send-email', async (req, res) => {
  const { link } = req.body

  try {
    await transporter.sendMail({
      from: "TU_CORREO@bch.bancochile.cl",
      to: "mmillaqueo@bch.bancochile.cl",
      subject: "Enlace seguro generado",
      html: `
        <h3>Se ha generado un enlace seguro</h3>
        <p>Haz clic aquí:</p>
        <a href="${link}">${link}</a>
      `
    })

    res.status(200).json({ message: "Correo enviado" })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al enviar correo" })
  }
})

app.listen(3001, () => {
  console.log("Servidor de correo corriendo en puerto 3001")
})