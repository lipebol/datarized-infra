### Never send your "passwords" in Production ###

FROM docker.io/azul/zulu-openjdk:21
ENV \
    DRILL_VERSION=1.22.0 \
    DRILL_ADMIN=<username> \
    DRILL_ADMIN_PASSWORD=<password>
RUN \
    apt update && apt upgrade -y \
    && apt install wget apache2-utils -y \
    && rm -rf /var/lib/apt/lists/* \
    && wget -c https://dlcdn.apache.org/drill/$DRILL_VERSION/apache-drill-$DRILL_VERSION.tar.gz \
    && tar -xvzf apache-drill-$DRILL_VERSION.tar.gz \
    && mkdir -p /opt/drill/conf/ \
    && cd apache-drill-$DRILL_VERSION/conf \
    && rm -rf drill-override.conf \
    && mv * /opt/drill/conf/ && cd .. \
    && rm -rf conf/ && mv * /opt/drill/ \
    && rm -rf /apache-drill-$DRILL_VERSION \
    && htpasswd -nb $DRILL_ADMIN $DRILL_ADMIN_PASSWORD > /opt/drill/conf/htpasswd \
    && chmod 644 /opt/drill/conf/htpasswd
WORKDIR /opt/drill/
CMD ["/bin/sh", "-c", "bin/sqlline -u jdbc:drill:zk=local -n ${DRILL_ADMIN} -p ${DRILL_ADMIN_PASSWORD}"]