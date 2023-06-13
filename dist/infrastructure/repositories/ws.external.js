"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qr_image_1 = require("qr-image");
/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends whatsapp_web_js_1.Client {
    constructor() {
        super({
            authStrategy: new whatsapp_web_js_1.LocalAuth(),
            puppeteer: { headless: true, args: ['--no-sandbox'] },
        });
        this.status = false;
        this.arrayTelefonos = [];
        this.arrayUsuarios = {}; // Array que contiene todos los usuarios que enteractuan con el bot y la api 
        this.generateImage = (base64) => {
            const path = `${process.cwd()}/tmp`;
            let qr_svg = (0, qr_image_1.image)(base64, { type: "svg", margin: 4 });
            qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.svg`));
            console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
            console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
        };
        /**
         * Metodo que escucha todos los mensajes que le llegan al telefono servidor
         */
        this.EM = () => this.on('message', (msg) => __awaiter(this, void 0, void 0, function* () {
            const { from, body, hasMedia, type, isForwarded } = msg; // variable sobtenidas del mensaje entrante
            const telefono = from.split('@');
            //---------------------------------------------------------------------
            /**
             * Empieza la validacion del flujo princiapal del bot
             */
            if (this.arrayUsuarios[telefono[0]] === undefined) {
                this.arrayUsuarios[telefono[0]] = { "estado": 'Activo', "menu": '', "opcion": '', "entrada": false, "perVa": '', "recibo": false, "queja": false, "sugerencia": false };
                let media = whatsapp_web_js_1.MessageMedia.fromFilePath(`${__dirname}/../../assets/Inicial_Bot.png`);
                this.sendMessage(from, media, { caption: '**!Bienvenido a tu Asistente virtual INNOVABOT¡** \n \n Menu de opciones Disponibles \n \n *0*.- 📋 Control de Asistencia \n *1*.- 💬 Quejas y Sugerencias \n *2*.- 🏃 Salir \n \n Escribe el **numero** del proceso a realizar.' });
                /*
                let media = MessageMedia.fromFilePath(`${__dirname}/../../assets/error2.png`);
                this.sendMessage(from, media)
               */
            }
            else if (this.arrayUsuarios[telefono[0]]["estado"] == "Activo") {
                switch (body) {
                    case "0":
                        this.sendMessage(from, "*Control de Asistencia* \n Elige el proceso de control de asistencia a realizar \n *0*.- 🕗 Registrar entrada \n *1*.- 🕡 Registrar salida \n *2*.- ↩ Regresar a menu principal \n \n Para continuar escribe el **numero** de la opcion");
                        this.arrayUsuarios[telefono[0]]["opcion"] = 'controlAsistencia';
                        this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
                        break;
                    case "1":
                        this.sendMessage(from, "*Quejas y/o Sugerencias! \n Elige el proceso de control de asistencia a realizar \n \n*0*.- ⚠ Registrar Queja \n*1*.- 🔊 Registrar Sugerencia \n*2*.- ↩ Regresar a menu principal  \n \n Para continuar escribe el **numero** de la opcion");
                        this.arrayUsuarios[telefono[0]]["opcion"] = 'quejas';
                        this.arrayUsuarios[telefono[0]]["estado"] = "enMenu";
                        break;
                    case "2":
                        this.sendMessage(from, "Vuelve pronto, hasta luego");
                        this.arrayUsuarios[telefono[0]] = undefined;
                        break;
                    default:
                        let media = yield whatsapp_web_js_1.MessageMedia.fromFilePath(`${__dirname}/../../assets/Inicial_Bot.png`);
                        this.sendMessage(from, media, { caption: '**!Bienvenido a tu Asistente virtual INNOVABOT¡** \n \n Menu de opciones Disponibles \n \n *0*.- 📋 Control de Asistencia \n *1*.- 💬 Quejas y Sugerencias \n *2*.- 🏃 Salir \n \n Escribe el **numero** del proceso a realizar.' });
                        break;
                }
            }
            /**
             * Manejo de menus de opciones internos del primer flujo del Bot
             */
            else if (this.arrayUsuarios[telefono[0]]["estado"] == "enMenu") {
                switch (this.arrayUsuarios[telefono[0]]["opcion"]) {
                    case 'controlAsistencia':
                        if (body == '0') {
                            this.sendMessage(from, "*Seleccionaste entrada*  \n \n Para registrar tu entrada envia tu ubicacion actual  \n 📍📍📍📍📍");
                            this.arrayUsuarios[telefono[0]]["entrada"] = true;
                        }
                        else if (body == '1') {
                            this.sendMessage(from, "*Seleccionaste salida*  \n \n Para registrar salida envia tu ubicacion actual  \n 📍📍📍📍📍");
                        }
                        else if (msg.location !== undefined) {
                            if (this.arrayUsuarios[telefono[0]]["entrada"]) {
                                let media = whatsapp_web_js_1.MessageMedia.fromFilePath(`${__dirname}/../../assets/Registro_Exitoso.png`);
                                this.sendMessage(from, media, { caption: "Asistencia Registrada \n\n *!Proceso terminado¡* \n Para continuar escribe la palabra *menu*" });
                                this.arrayUsuarios[telefono[0]]["entrada"] = false;
                                this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                            }
                            else {
                                let media = whatsapp_web_js_1.MessageMedia.fromFilePath(`${__dirname}/../../assets/Registro_Exitoso.png`);
                                this.sendMessage(from, media, { caption: "Salida Registrada \n\n *!Proceso terminado¡* \n Para continuar escribe la palabra *menu*" });
                                this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                            }
                            /*
                              let media = MessageMedia.fromFilePath(`${__dirname}/../../assets/fuera_rango.png`);
                              this.sendMessage(from, media)
                              this.arrayUsuarios[telefono[0]]["estado"] = "Activo"
                            */
                        }
                        else if (body == '2') {
                            this.sendMessage(from, "**Regresar a menu principal** \n Escribe la palabra *menu* para continuar");
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                        }
                        else {
                            this.sendMessage(from, "*Opcion no valida para control de asistencia*");
                        }
                        break;
                    case 'quejas':
                        if (body == '0') {
                            this.sendMessage(from, "**Quejas y Sugerencias** \n \n Escribe el *texto* de la queja a continuación:");
                            this.arrayUsuarios[telefono[0]]["queja"] = true;
                        }
                        else if (body == '1') {
                            this.sendMessage(from, "**Quejas y Sugerencias** \n \n Escribe el *texto* de la sugerencia a continuación:");
                            this.arrayUsuarios[telefono[0]]["sugerencia"] = true;
                        }
                        else if (body == '2') {
                            this.sendMessage(from, "**Regresar a menu principal** \n Escribe *menu* para continuar");
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                        }
                        else if (this.arrayUsuarios[telefono[0]]["queja"]) {
                            this.sendMessage(from, "**Queja Registrada con exito**");
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                        }
                        else if (this.arrayUsuarios[telefono[0]]["sugerencia"]) {
                            this.sendMessage(from, "**Sugerencia Registrada con exito**");
                            this.arrayUsuarios[telefono[0]]["estado"] = "Activo";
                        }
                        else {
                            this.sendMessage(from, "*Opcion no valida para Quejas y/o Sugerencias*");
                        }
                        break;
                }
            }
        }));
        console.log("Iniciando....");
        this.initialize();
        this.on("ready", () => {
            this.status = true;
            this.EM();
            console.log("LOGIN_SUCCESS");
        });
        this.on("auth_failure", () => {
            this.status = false;
            console.log("LOGIN_FAIL");
        });
        this.on("qr", (qr) => {
            console.log('Escanea el codigo QR que esta en la carepta tmp');
            this.generateImage(qr);
        });
    }
    /**
     * Enviar mensaje de WS
     * @param lead
     * @returns
     */
    sendMsg(lead) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.status)
                    return Promise.resolve({ error: "WAIT_LOGIN" });
                const { message, phone } = lead;
                const response = yield this.sendMessage(`${phone}@c.us`, message);
                return { id: response.id.id };
            }
            catch (e) {
                return Promise.resolve({ error: e.message });
            }
        });
    }
    getStatus() {
        return this.status;
    }
}
exports.default = WsTransporter;
