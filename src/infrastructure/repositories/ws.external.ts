import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";
import axios from 'axios';
/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;
  arrayTelefonos: any = []
  arrayUsuarios: any = {}; // Array que contiene todos los usuarios que enteractuan con el bot y la api 
  private EM: any; //Metodo encargado de escuchar todos los mensajes que recibe el bot

  constructor() {
    super({
      authStrategy: new LocalAuth(),
      puppeteer: { headless: true, args: ['--no-sandbox'] },
    });

    /**
     * Metodo que escucha todos los mensajes que le llegan al telefono servidor
     */
    this.EM = () => this.on('message', async msg => {
      const { from, body, hasMedia, type, isForwarded } = msg; // variable sobtenidas del mensaje entrante
      const telefono = from.split('@')

      //---------------------------------------------------------------------
      /**
       * Empieza la validacion del flujo princiapal del bot
       */

      if (this.arrayUsuarios[telefono[0]] === undefined) {
        console.log(telefono[0])

        axios.get('http://boot.devcodegroup.com.mx/usuarios.php?tabla=usuarios&telefono=' + telefono[0])
          .then((response) => {
            console.log(response.data[0])

            if (response.data != '' && response.data[0]['estado'] != 0) {

              if (response.data[0].rol == "Admin") {

                this.arrayUsuarios[telefono[0]] = { "estado": 'Activo', "menu": '', "opcion": '', "entrada": false, "salida": false, "data": response.data, alta: false, baja: false };
                let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Principal_Bot.jpeg`);
                this.sendMessage(from, media, { caption: '**HOLA  ' + this.arrayUsuarios[telefono[0]]['data'][0].nombre.toUpperCase() + ' BIENVENIDO AL ASISTENTE VIRTUAL TIMEBOT** \n\n   Elige una opcion del menu que se muestra acontinuacion\n \n *0*.- ✅ Alta/ Baja de Personal \n *1*.- 🌞 Registro Entrada \n *2*.- 🌛 Registro Salida \n *3*.- ⚠ Registro Incidencias \n *4*.- 📝 Historial Asistencias \n *5*.- 🏃 Salir  \n \n Escribe el **numero** del proceso a realizar.' });

              } else if (response.data[0].rol == "Empleado") {
                this.arrayUsuarios[telefono[0]] = { "estado": 'Activo', "menu": '', "opcion": '', "entrada": false, "salida": false, "data": response.data, alta: false, baja: false };
                let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Principal_Bot.jpeg`);
                this.sendMessage(from, media, { caption: '**HOLA  ' + this.arrayUsuarios[telefono[0]]['data'][0].nombre.toUpperCase() + ' BIENVENIDO AL ASISTENTE VIRTUAL TIMEBOT** \n\n   Elige una opcion del menu que se muestra acontinuacion\n \n *0*.- 🌞 Registro Entrada \n *1*.- 🌛 Registro Salida \n *2*.- ⚠ Registro Incidencias \n *3*.- 🏃 Salir  \n \n Escribe el **numero** del proceso a realizar.' });
              }

            } else {
              let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/numero_no_registrado.jpeg`);
              this.sendMessage(from, media)
            }
          })
          .catch(function (error) {
            // Handle error
            console.log(error);
          });

      }

      else if (this.arrayUsuarios[telefono[0]]["estado"] == "Activo") {

        if (this.arrayUsuarios[telefono[0]]['data'][0].rol == 'Admin') {
          switch (body) {
            case "0":
              this.sendMessage(from, "**Seleccionaste Alta/ Baja de personal** \n\n En que proceso deseas que te ayude? \n\n *0*.- ✅ Alta Personal \n *1*.- ❌ Baja Personal \n *2*.- ↩️ Regresar a menu principal \n \n Seleccionalo escribiendo el **numero** de la opcion")
              this.arrayUsuarios[telefono[0]]["opcion"] = 'altaBajaPersonal'
              this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
              break;

            case "1":
              this.sendMessage(from, "**Registro Entrada** \n \n Perfecto " + this.arrayUsuarios[telefono[0]]['data'][0].nombre + " ahora te ayudare a registrar tu asistencia del dia de hoy \n\n Para seguir con el proceso necesitas enviar tu ubicacion actual \n\n 📌📌📌📌📌📌")
              this.arrayUsuarios[telefono[0]]["opcion"] = 'registroEntrada'
              this.arrayUsuarios[telefono[0]]["entrada"] = true
              this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
              break;

            case "2":
              this.sendMessage(from, "**Registro Salida** \n \n Perfecto " + this.arrayUsuarios[telefono[0]]['data'][0].nombre + " ahora te ayudare a registrar tu salida del dia de hoy \n\n Para seguir con el proceso necesitas enviar tu ubicacion actual \n\n 📌📌📌📌📌📌")
              this.arrayUsuarios[telefono[0]]["opcion"] = 'registroSalida'
              this.arrayUsuarios[telefono[0]]["salida"] = true
              this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
              break;

            case "3":
              this.sendMessage(from, "**Registro de Incidencias** \n\n Escribe el texto de la incidencia, as como el area en la que se presento")
              this.arrayUsuarios[telefono[0]]["opcion"] = 'incidencias'
              this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
              break;

            case "4":
              this.sendMessage(from, "**Historial Asistencias** \n\n Elige del menu de opciones lo que quieres ver \n\n *0*.- ✅ Listado Asistencias \n *1*.- ❌ Listado Faltas \n *2*.- ↩️ Regresar a menu principal \n \n Seleccionalo escribiendo el **numero** de la opcion")
              this.arrayUsuarios[telefono[0]]["opcion"] = 'historial'
              this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
              break;

            case "5":
              this.sendMessage(from, "Vuelve pronto, hasta luego")
              this.arrayUsuarios[telefono[0]] = undefined
              break;

            default:
              /*
              let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Principal_Bot.jpeg`);
              this.sendMessage(from, media, { caption: '**HOLA  ' + this.arrayUsuarios[telefono[0]]['data'][0].nombre.toUpperCase() + ' BIENVENIDO aAL ASISTENTE VIRTUAL TIMEBOT** \n\n   Elige una opcion del menu que se muestra acontinuacion\n \n *0*.- 🌞 Registro Entrada \n *1*.- 🌛 Registro Salida \n *2*.- ⚠ Registro Incidencias \n *3*.- 🏃 Salir  \n \n Escribe el **numero** del proceso a realizar.' });
             */
              console.log(this.arrayUsuarios[telefono[0]]['data'][0].rol == 'Admin')
              if (this.arrayUsuarios[telefono[0]]['data'][0].rol == 'Admin') {
                let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Principal_Bot.jpeg`);
                this.sendMessage(from, media, { caption: '**HOLA  ' + this.arrayUsuarios[telefono[0]]['data'][0].nombre.toUpperCase() + ' BIENVENIDO AL ASISTENTE VIRTUAL TIMEBOT** \n\n   Elige una opcion del menu que se muestra acontinuacion\n \n *0*.- ✅ Alta/ Baja de Personal \n *1*.- 🌞 Registro Entrada \n *2*.- 🌛 Registro Salida \n *3*.- ⚠ Registro Incidencias \n *4*.- 📝 Historial Asistencias \n *5*.- 🏃 Salir  \n \n Escribe el **numero** del proceso a realizar.' });
              } else if(this.arrayUsuarios[telefono[0]]['data'][0].rol == 'Empleado'){
                let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Principal_Bot.jpeg`);
                this.sendMessage(from, media, { caption: '**HOLA  ' + this.arrayUsuarios[telefono[0]]['data'][0].nombre.toUpperCase() + ' BIENVENIDO aAL ASISTENTE VIRTUAL TIMEBOT** \n\n   Elige una opcion del menu que se muestra acontinuacion\n \n *0*.- 🌞 Registro Entrada \n *1*.- 🌛 Registro Salida \n *2*.- ⚠ Registro Incidencias \n *3*.- 🏃 Salir  \n \n Escribe el **numero** del proceso a realizar.' });
              }
              break;
          }
        } else {
          switch (body) {
            case "0":
              this.sendMessage(from, "**Registro Entrada** \n \n Perfecto " + this.arrayUsuarios[telefono[0]]['data'][0].nombre + " ahora te ayudare a registrar tu asistencia del dia de hoy \n\n Para seguir con el proceso necesitas enviar tu ubicacion actual \n\n 📌📌📌📌📌📌")
              this.arrayUsuarios[telefono[0]]["opcion"] = 'registroEntrada'
              this.arrayUsuarios[telefono[0]]["entrada"] = true
              this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
              break;

            case "1":
              this.sendMessage(from, "**Registro Salida** \n \n Perfecto " + this.arrayUsuarios[telefono[0]]['data'][0].nombre + " ahora te ayudare a registrar tu salida del dia de hoy \n\n Para seguir con el proceso necesitas enviar tu ubicacion actual \n\n 📌📌📌📌📌📌")
              this.arrayUsuarios[telefono[0]]["opcion"] = 'registroSalida'
              this.arrayUsuarios[telefono[0]]["salida"] = true
              this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
              break;

            case "2":
              this.sendMessage(from, "**Registro de Incidencias** \n\n Escribe el texto de la incidencia, as como el area en la que se presento")
              this.arrayUsuarios[telefono[0]]["opcion"] = 'incidencias'
              this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
              break;

            case "3":
              this.sendMessage(from, "Vuelve pronto, hasta luego")
              this.arrayUsuarios[telefono[0]] = undefined
              break;

            default:
              console.log(this.arrayUsuarios[telefono[0]]['data'][0].rol == 'Admin')
              if (this.arrayUsuarios[telefono[0]]['data'][0].rol == 'Admin') {
                let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Principal_Bot.jpeg`);
                this.sendMessage(from, media, { caption: '**HOLA  ' + this.arrayUsuarios[telefono[0]]['data'][0].nombre.toUpperCase() + ' BIENVENIDO AL ASISTENTE VIRTUAL TIMEBOT** \n\n   Elige una opcion del menu que se muestra acontinuacion\n \n *0*.- ✅ Alta/ Baja de Personal \n *1*.- 🌞 Registro Entrada \n *2*.- 🌛 Registro Salida \n *3*.- ⚠ Registro Incidencias \n *4*.- 📝 Historial Asistencias \n *5*.- 🏃 Salir  \n \n Escribe el **numero** del proceso a realizar.' });
              } else if(this.arrayUsuarios[telefono[0]]['data'][0].rol == 'Empleado'){
                let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Principal_Bot.jpeg`);
                this.sendMessage(from, media, { caption: '**HOLA  ' + this.arrayUsuarios[telefono[0]]['data'][0].nombre.toUpperCase() + ' BIENVENIDO aAL ASISTENTE VIRTUAL TIMEBOT** \n\n   Elige una opcion del menu que se muestra acontinuacion\n \n *0*.- 🌞 Registro Entrada \n *1*.- 🌛 Registro Salida \n *2*.- ⚠ Registro Incidencias \n *3*.- 🏃 Salir  \n \n Escribe el **numero** del proceso a realizar.' });
              }

              break;
          }
        }


      }
      /**
       * Manejo de menus de opciones internos del primer flujo del Bot
       */
      else if (this.arrayUsuarios[telefono[0]]["estado"] == "enMenu") {

        if (this.arrayUsuarios[telefono[0]]['data'][0].rol == 'Admin') {

          switch (this.arrayUsuarios[telefono[0]]["opcion"]) {
            case 'altaBajaPersonal':

              if (body == '0') {
                try {
                  this.sendMessage(from, "Alta de Personal \n\n Ingresa el numero de **telefono** del usuario que deseas dar de alta")
                  this.arrayUsuarios[telefono[0]]["alta"] = true
                } catch (error) {
                  this.sendMessage(from, "Entrada no Valida, Intenta ingresando un numero de telefono valido")
                }

              } else if (body == '1') {
                this.sendMessage(from, "Baja de Personal \n\n Ingresa el numero de **telefono** del usuario que deseas dar de baja")
                this.arrayUsuarios[telefono[0]]["baja"] = true
              } else if(body == '2'){
                this.sendMessage(from, "**Regresar a menu principal** \n Escribe la palabra *menu* para continuar");
                this.arrayUsuarios[telefono[0]]["estado"] = "Activo"

              } else if (this.arrayUsuarios[telefono[0]]["alta"]) {
                try {
                  let dataAlta = {
                    estado: "1",
                    telefono: "521" + body
                  }

                  axios.put("http://boot.devcodegroup.com.mx/usuarios.php", dataAlta).then((response: any) => {
                    console.log(response)
                    if (response.data != '') {

                      this.sendMessage(from, "**¡Usuario dado de alta Correctamente!** \n Desde este momento puede interactuar con el asistente virtual \n Si deseas continuar interactuando escribe la palabra **menu**")
                      // this.sendMessage(from, botones)
                      this.arrayUsuarios[telefono[0]]["alta"] = false
                      this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                    } else {
                      this.sendMessage(from, "Entrada no Valida, Intenta ingresando un numero de telefono valido")
                    }
                  })
                } catch (error) {
                  this.sendMessage(from, "Entrada no Valida, Intenta ingresando un numero de telefono valido")
                }



              } else if (this.arrayUsuarios[telefono[0]]["baja"]) {

                let dataBaja = {
                  estado: "0",
                  telefono: "521" + body
                }

                axios.put("http://boot.devcodegroup.com.mx/usuarios.php", dataBaja).then((response: any) => {
                  console.log(response)
                  if (response.data != '') {

                    this.sendMessage(from, "**¡Usuario dado de baja Correctamente!** \n Desde este momento puede interactuar con el asistente virtual \n Si deseas continuar interactuando escribe la palabra **menu**")
                    // this.sendMessage(from, botones)
                    this.arrayUsuarios[telefono[0]]["alta"] = false
                    this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                  }
                })

              }

              break;

            case 'registroEntrada':

              if (msg.location !== undefined) {

                if (this.arrayUsuarios[telefono[0]]["entrada"]) {

                  let dataEntrada = {
                    idUsuario: this.arrayUsuarios[telefono[0]]['data'][0].id
                  }

                  axios.post("http://boot.devcodegroup.com.mx/asistencia_usuarios.php", dataEntrada).then((response: any) => {


                    let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Registro_Exitoso.png`);
                    this.sendMessage(from, media, { caption: "**¡Gracias! Has marcado tu entrada correctamente** \n Si deseas continuar interactuando escribe la palabra **menu**" })

                    this.arrayUsuarios[telefono[0]]["estado"] = "Activo"

                  })

                } else if(this.arrayUsuarios[telefono[0]]["salida"]){


                }

              }
              else {
                this.sendMessage(from, "*Opcion no valida para registro de asistencia* \n Escribe menu de nuevo para eleir otra opcion del menu");
                this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
              }
              break;

            case 'registroSalida':
              if (msg.location !== undefined) {

                if (this.arrayUsuarios[telefono[0]]["salida"]) {

                  let dataSalida = {
                    idUsuario: this.arrayUsuarios[telefono[0]]['data'][0].id
                  }

                  axios.put("http://boot.devcodegroup.com.mx/asistencia_usuarios.php", dataSalida).then((response: any) => {

                    if (response.data != '') {
                      //let botones = new Buttons('Asistencia de ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + ' Registrada Correctamente', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅      ASISTENCIA      ✅', 'Control de Asistencia')
                      let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Registro_Exitoso.png`);
                      this.sendMessage(from, media, { caption: "**¡Gracias! Has marcado tu salida correctamente** \n Si deseas continuar interactuando escribe la palabra **menu**" })
                      // this.sendMessage(from, botones)
                      this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                    }
                  })



                }

              }
              else {
                this.sendMessage(from, "*Opcion no valida para registro de asistencia*");
              }
              break;

            case 'incidencias':
              this.sendMessage(from, "**Registro de Incidencias** \n\n Incidencia registrada correctamente, en breve recibiras notificacion del estatus de tu registro")
              this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
              break;

            case 'historial':
              if (body == '0') {

                axios.get("http://boot.devcodegroup.com.mx/asistencia_usuarios.php?asistencia")
                  .then((response) => {
                    console.log(response.data)
                    let cadena: any = ''
                    response.data.forEach( (element: any, index:any) => {
                      let c = (index +1) + ' ' + element.nombre + ' ' + element.fecha_inicio + '\n'

                      cadena = cadena + c
                    });
                    this.sendMessage(from, cadena)
                  })


              } else if (body == '1') {
                axios.get("http://boot.devcodegroup.com.mx/asistencia_usuarios.php?inasistencia")
                .then((response) => {
                  console.log(response.data)
                  let cadena: any = ''
                  response.data.forEach( (element: any, index:any) => {
                    let c = (index +1) + ' ' + element.nombre +  '\n'

                    cadena = cadena + c
                  });
                  this.sendMessage(from, cadena)
                })
              } else if(body == '2'){
                this.sendMessage(from, "**Regresar a menu principal** \n Escribe la palabra *menu* para continuar");
                this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
              }
              break;

            default:
              this.sendMessage(from, "*Opcion no valida para registro de asistencia*");
              break;
          }

        } else {
          switch (this.arrayUsuarios[telefono[0]]["opcion"]) {

            case 'registroEntrada':

              if (msg.location !== undefined) {

                if (this.arrayUsuarios[telefono[0]]["entrada"]) {

                  let dataEntrada = {
                    idUsuario: this.arrayUsuarios[telefono[0]]['data'][0].id
                  }

                  axios.post("http://boot.devcodegroup.com.mx/asistencia_usuarios.php", dataEntrada).then((response: any) => {


                    let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Registro_Exitoso.png`);
                    this.sendMessage(from, media, { caption: "**¡Gracias! Has marcado tu entrada correctamente** \n Si deseas continuar interactuando escribe la palabra **menu**" })

                    this.arrayUsuarios[telefono[0]]["estado"] = "Activo"

                  })



                } else {


                }

              }
              else {
                this.sendMessage(from, "*Opcion no valida para registro de asistencia* \n Escribe menu de nuevo para eleir otra opcion del menu");
                this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
              }
              break;

            case 'registroSalida':
              if (msg.location !== undefined) {

                if (this.arrayUsuarios[telefono[0]]["salida"]) {

                  let dataSalida = {
                    idUsuario: this.arrayUsuarios[telefono[0]]['data'][0].id
                  }

                  axios.put("http://boot.devcodegroup.com.mx/asistencia_usuarios.php", dataSalida).then((response: any) => {

                    if (response.data != '') {
                      //let botones = new Buttons('Asistencia de ' + this.arrayUsuarios[telefono[0]]['data'][0].strNombre + ' Registrada Correctamente', [{ body: 'Regresar a menu' }, { body: 'Salir' }], '   ✅      ASISTENCIA      ✅', 'Control de Asistencia')
                      let media = MessageMedia.fromFilePath(`${process.cwd()}/dist/assets/Registro_Exitoso.png`);
                      this.sendMessage(from, media, { caption: "**¡Gracias! Has marcado tu entrada correctamente** \n Si deseas continuar interactuando escribe la palabra **menu**" })
                      // this.sendMessage(from, botones)
                      this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                    }
                  })



                }

              }
              else {
                this.sendMessage(from, "*Opcion no valida para registro de asistencia*");
              }
              break;

            case 'incidencias':
              this.sendMessage(from, "**Registro de Incidencias** \n\n Incidencia registrada correctamente, en breve recibiras notificacion del estatus de tu registro")
              this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
              break;



            default:
              this.sendMessage(from, "*Opcion no valida para registro de asistencia*");
              break;
          }
        }


      }
    });

    console.log("Iniciando....");

    this.initialize();

    this.on("ready", () => {
      this.status = true;
      this.EM()
      console.log("LOGIN_SUCCESS");
    });

    this.on("auth_failure", () => {
      this.status = false;
      console.log("LOGIN_FAIL");
    });

    this.on("qr", (qr) => {
      console.log('Escanea el codigo QR que esta en la carepta tmp')
      this.generateImage(qr)
    });
  }

  /**
   * Enviar mensaje de WS
   * @param lead
   * @returns
   */
  async sendMsg(lead: { message: string; phone: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
      const { message, phone } = lead;
      const response = await this.sendMessage(`${phone}@c.us`, message);
      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  getStatus(): boolean {
    return this.status;
  }

  private generateImage = (base64: string) => {
    const path = `${process.cwd()}/tmp`;
    let qr_svg = imageQr(base64, { type: "svg", margin: 4 });
    qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.svg`));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
  };
}

export default WsTransporter;
