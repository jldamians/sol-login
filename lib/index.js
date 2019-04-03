'use strict'

function LoginForm(ruc, username, password, page) {
  let _args = {
    page,
    ruc,
    username,
    password
  }

  Object.defineProperty(this, 'ruc', {
    get: () => { return _args.ruc },
  })

  Object.defineProperty(this, 'username', {
    get: () => { return _args.username },
  })

  Object.defineProperty(this, 'password', {
    get: () => { return _args.password },
  })

  Object.defineProperty(this, 'page', {
    get: () => { return _args.page },
  })
}

/**
 * Inicia sesión
 */
LoginForm.prototype.login = async function() {
  // Activamos la opción de logeo con RUC
  try {
    const RucAccessButton = await this.page.waitForSelector('button#btnPorRuc', {
      timeout: 5000, // Wait five seconds
      visible: true // Wait for element to be present in DOM and to be visible
    })

    await RucAccessButton.click()
  } catch (e) {
    throw new Error(
      'La opción para autenticar con RUC no está disponible'
    )
  }

  // Ingresamos los datos de acceso e iniciamos sesión
  try {
    const LoginButton = await this.page.waitForSelector('button#btnAceptar', {
      timeout: 5000,
      visible: true
    })

    const TaxpayerRucInput = await this.page.waitForSelector('input#txtRuc', {
      timeout: 5000,
      visible: true
    })

    const TaxpayerUsernameInput = await this.page.waitForSelector('input#txtUsuario', {
      timeout: 5000,
      visible: true
    })

    const TaxpayerPasswordInput = await this.page.waitForSelector('input#txtContrasena', {
      timeout: 5000,
      visible: true
    })

    await TaxpayerRucInput.type(this.ruc)

    await TaxpayerUsernameInput.type(this.username)

    await TaxpayerPasswordInput.type(this.password)

    await LoginButton.click()
  } catch (exception) {
    throw new Error(
      `Los controles de autenticación no están disponibles (${exception.message})`
    )
  }
}

module.exports = LoginForm
