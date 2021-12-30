import { exec as child } from "child-process-promise";
import { Logger } from "winston";

const erroredPackages: string[] = [];

const packagesBeingInstalled = new Set<string>();

export const loadPlugins = async (logger: Logger, packageNames: string[]) => {
  const packagesToInstall = (
    await Promise.all(
      packageNames.map(async (packageName) => {
        try {
          await import(packageName);
          return [packageName, false] as const;
        } catch (error) {
          return [packageName, true] as const;
        }
      })
    )
  )
    .filter(([_, isLoaded]) => isLoaded)
    .map(([packageName]) => packageName);
  logger.verbose("Installing packages", { packagesToInstall });

  const packages = packagesToInstall
    .filter((packageName) => {
      if (erroredPackages.includes(packageName)) {
        logger.silly("Skipping package as it errored", { packageName });
        return false;
      }
      return true;
    })
    .filter((packageName) => {
      if (packagesBeingInstalled.has(packageName)) {
        logger.silly("Skipping package as it is already being installed", {
          packageName,
        });
        return false;
      }
      return true;
    })
    .map(async (packageName) => {
      packagesBeingInstalled.add(packageName);
      try {
        logger.silly("Installing package", { packageName });
        const result = await child(`yarn add ${packageName}`);
        try {
          await import(packageName);
          logger.info("Package installed", { packageName });
        } catch (error) {
          logger.error("Error importing package after npm install", { error });
        }
        return [packageName, result] as const;
      } catch (error) {
        erroredPackages.push(packageName);
        logger.error(error);
        return [packageName, error as Error] as const;
      } finally {
        packagesBeingInstalled.delete(packageName);
      }
    });

  const result = await Promise.all(packages);
  const successes = result.filter(([, result]) => !(result instanceof Error));
  const errors = result.filter(([, result]) => result instanceof Error);
  if (errors.length > 0) {
    logger.error("Unable to install packages", {
      packages: errors.map(([packageName]) => packageName),
    });
  }
  if (successes.length > 0) {
    logger.info("Packages successfully installed", {
      packages: successes.map(([packageName]) => packageName),
    });
  }
  console.log(result);
};
