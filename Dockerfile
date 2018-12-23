FROM ubuntu:18.04
MAINTAINER Guy Sheffer <guysoft@gmail.com>

EXPOSE 8080
EXPOSE 80


ENV LANG_WHICH en
ENV LANG_WHERE US
ENV ENCODING UTF-8
ENV LANGUAGE ${LANG_WHICH}_${LANG_WHERE}.${ENCODING}
ENV LANG ${LANGUAGE}

ARG DEBIAN_FRONTEND=noninteractive
RUN dpkg --add-architecture i386 && apt-get update
RUN apt-get install -y curl
RUN apt-get install -y xdotool wine-stable coreutils xserver-xephyr xvfb winetricks locales ca-certificates \
    sudo \
    nsis \
    tzdata \
    apt-utils \
    python3 \
    python3-dev\
    python3-distutils \
    wget \
    matchbox-window-manager \
    x11vnc \
    python \
    python-dev \
    curl \
    gnupg2 \
    git \
  && locale-gen ${LANGUAGE} \
  && locale-gen he_IL.UTF-8 \
  && dpkg-reconfigure --frontend noninteractive locales \
  && rm -rf /var/lib/apt/lists/* \
  && apt -qyy clean


# echo Manual do:
# echo uncomment "he_IL.UTF-8 UTF-8" in /etc/locale.gen

#===================
# Timezone settings
#===================
# Full list at https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
#  e.g. "US/Pacific" for Los Angeles, California, USA
# e.g. ENV TZ "US/Pacific"
ENV TZ="Asia/Jerusalem"
# Apply TimeZone
# Layer size: tiny: 1.339 MB
RUN echo "Setting time zone to '${TZ}'" \
  && echo "${TZ}" > /etc/timezone \
  && dpkg-reconfigure --frontend noninteractive tzdata


#========================================
# Add normal user with passwordless sudo
#========================================
# Layer size: tiny: 0.3 MB
RUN useradd wineuser \
         --shell /bin/bash  \
         --create-home \
  && usermod -a -G sudo wineuser \
  && gpasswd -a wineuser video \
  && echo 'wineuser:secret' | chpasswd \
  && useradd extrauser \
         --shell /bin/bash  \
  && usermod -a -G sudo extrauser \
  && gpasswd -a extrauser video \
  && gpasswd -a extrauser wineuser \
  && echo 'extrauser:secret' | chpasswd \
&& echo 'ALL ALL = (ALL) NOPASSWD: ALL' >> /etc/sudoers


# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash
RUN apt-get install --yes nodejs
RUN node -v
RUN npm -v
RUN npm i -g nodemon
RUN nodemon -v

COPY . /home/wineuser/twinejs
RUN chown wineuser:wineuser /home/wineuser/twinejs
WORKDIR /home/wineuser/twinejs
USER wineuser

RUN npm install --unsafe-perm=true --allow-root

ENTRYPOINT ["/usr/bin/npm", "start"]

