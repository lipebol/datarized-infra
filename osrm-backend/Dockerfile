### Never send your "passwords" in Production ###
FROM ghcr.io/project-osrm/osrm-backend AS base-build

RUN \
    mkdir /opt/data \
    && wget -c https://download.geofabrik.de/north-america/us/illinois-latest.osm.pbf \
    -O /opt/data/illinois-latest.osm.pbf

# === osrm-bicycle ===
FROM base-build AS osrm-us-illinois-bicycle
RUN \
    osrm-extract -p /opt/bicycle.lua /opt/data/illinois-latest.osm.pbf \
    && osrm-partition /opt/data/illinois-latest.osrm \
    && osrm-customize /opt/data/illinois-latest.osrm


### ==== Alternative

# Since I'm running "podman" inside "incus" and I don't want to change the "cpu" and "ram" limits, 
# I preferred to run it externally in an "osrm-backend" container, map a volume, 
# process the "osm.pbf" file, and then copy the volume.

### ==== to ".tar"
# <docker_or_podman> run --rm -v <volume_name>:/osrm-data -v $(pwd):/backup ubuntu tar cvf /backup/osrm_data.tar /osrm-data

### ==== transfer ...
# scp osrm_data.tar <user>@<host-ip>:/home/<user>/

### ==== create a new volume and then fill it with the files
# <docker_or_podman> run --rm -v <volume_name>:/osrm-data -v $(pwd):/backup ubuntu bash -c "tar xvf /backup/osrm_data.tar -C /osrm-data --strip-components=1"