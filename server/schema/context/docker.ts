import Docker, { DockerOptions } from "dockerode";

let docker: Docker | null = null;

export async function getDocker(config: DockerOptions): Promise<Docker> {
  // TODO: Handle if the config changes, will save a container restart?
  docker = docker ?? new Docker(config);
  console.log("Docker Setup");
  await docker.ping();
  console.log("Docker Pinged");
  return docker;
}
