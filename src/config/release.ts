import { latestRelease, getProductLabelForVersion, productMetadata } from '@/data/product-metadata'

const FALLBACK_VERSION = 'development'

const resolveReleaseVersion = (): string => {
  const envVersion = process.env.NEXT_PUBLIC_RELEASE_VERSION?.trim()
  if (envVersion) {
    return envVersion
  }

  const metadataVersion = latestRelease.version?.trim()
  if (metadataVersion) {
    return metadataVersion
  }

  return FALLBACK_VERSION
}

export const buildTemplateVersion = (version: string): string => `AUTOCRATE_TEMPLATE_V${version}`

export interface ReleaseIdentity {
  /** Semantic version for the currently deployed release. */
  version: string
  /** Human-readable label combining product name and version. */
  label: string
  /** Identifier for NX/STEP template artifacts tied to the release. */
  templateVersion: string
}

const releaseVersion = resolveReleaseVersion()

export const releaseIdentity: ReleaseIdentity = Object.freeze({
  version: releaseVersion,
  label: getProductLabelForVersion(releaseVersion),
  templateVersion: buildTemplateVersion(releaseVersion)
})

export const currentProductName = productMetadata.name
