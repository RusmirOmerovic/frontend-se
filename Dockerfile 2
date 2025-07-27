# 🔹 Basis-Image
FROM ubuntu:22.04

# 🔹 System aktualisieren & Tools installieren
RUN apt-get update && \
    apt-get install -y git curl bash

# 🔹 Arbeitsverzeichnis festlegen
WORKDIR /workspace

# 🔹 Projektdateien in den Container kopieren
COPY . .

# 🔹 Standard-Befehl beim Start
CMD ["bash"]

# Bash-Tools ausführbar machen
RUN chmod +x tools/*

# tools-Verzeichnis ins PATH aufnehmen
ENV PATH="/workspace/tools:${PATH}"
