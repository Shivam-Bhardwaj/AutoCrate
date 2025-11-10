/**
 * STEP to Three.js Mesh Converter
 * Uses OpenCascade.js to parse STEP files and convert to Three.js geometry
 */

import * as THREE from 'three'

// Type definitions for OpenCascade
declare global {
  interface Window {
    occt: any
  }
}

export interface StepMeshResult {
  geometry: THREE.BufferGeometry
  boundingBox: THREE.Box3
  center: THREE.Vector3
  material?: THREE.Material
}

/**
 * Initialize OpenCascade.js
 * Must be called once before using any STEP parsing functions
 */
export async function initializeOpenCascade(): Promise<void> {
  if (typeof window === 'undefined') return

  if (!window.occt) {
    // Load OpenCascade.js
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/opencascade.js@2.0.0-beta.3c5a518/dist/opencascade.full.js'
    document.head.appendChild(script)

    return new Promise((resolve, reject) => {
      script.onload = async () => {
        // Initialize OpenCascade
        const ocModule = await (window as any).opencascade({
          locateFile: () => 'https://cdn.jsdelivr.net/npm/opencascade.js@2.0.0-beta.3c5a518/dist/opencascade.full.wasm'
        })
        window.occt = ocModule
        console.log('OpenCascade.js initialized')
        resolve()
      }
      script.onerror = reject
    })
  }
}

/**
 * Parse STEP file content and convert to Three.js geometry
 */
export async function parseStepToGeometry(stepContent: string): Promise<StepMeshResult> {
  if (!window.occt) {
    throw new Error('OpenCascade not initialized. Call initializeOpenCascade() first.')
  }

  const oc = window.occt

  // Create a progress indicator
  const progress = new oc.Message_ProgressRange_1()

  // Read STEP file
  const reader = new oc.STEPControl_Reader_1()
  const readResult = reader.ReadFromMemory(stepContent, stepContent.length, progress)

  if (readResult !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
    throw new Error('Failed to read STEP file')
  }

  // Transfer to OpenCascade shape
  reader.TransferRoots(progress)
  const shape = reader.OneShape()

  // Triangulate the shape for mesh generation
  const mesher = new oc.BRepMesh_IncrementalMesh_2(shape, 0.01, false, 0.5, true)
  mesher.Perform(progress)

  // Extract triangulation data
  const vertices: number[] = []
  const indices: number[] = []
  const normals: number[] = []

  // Iterate through faces
  const explorer = new oc.TopExp_Explorer_2(shape, oc.TopAbs_ShapeEnum.TopAbs_FACE, oc.TopAbs_ShapeEnum.TopAbs_SHAPE)

  let indexOffset = 0

  while (explorer.More()) {
    const face = oc.TopoDS.Face_1(explorer.Current())
    const location = new oc.TopLoc_Location_1()
    const triangulation = oc.BRep_Tool.Triangulation(face, location, 0)

    if (triangulation.IsNull()) {
      explorer.Next()
      continue
    }

    // Get transformation
    const transformation = location.Transformation()

    // Get vertices
    const nbNodes = triangulation.NbNodes()
    for (let i = 1; i <= nbNodes; i++) {
      const node = triangulation.Node(i)
      const transformed = node.Transformed(transformation)
      vertices.push(transformed.X(), transformed.Y(), transformed.Z())
    }

    // Get triangles
    const nbTriangles = triangulation.NbTriangles()
    const orientation = face.Orientation_1()

    for (let i = 1; i <= nbTriangles; i++) {
      const triangle = triangulation.Triangle(i)
      let n1 = triangle.Value(1) - 1 + indexOffset
      let n2 = triangle.Value(2) - 1 + indexOffset
      let n3 = triangle.Value(3) - 1 + indexOffset

      // Reverse winding for reversed faces
      if (orientation === oc.TopAbs_Orientation.TopAbs_REVERSED) {
        indices.push(n1, n3, n2)
      } else {
        indices.push(n1, n2, n3)
      }
    }

    // Calculate normals for this face
    const surface = oc.BRep_Tool.Surface_2(face)
    const props = new oc.GeomLProp_SLProps_3(surface, 1, 2, 1e-6)

    for (let i = 1; i <= nbNodes; i++) {
      const node = triangulation.Node(i)
      const uv = triangulation.UVNode(i)
      props.SetParameters(uv.X(), uv.Y())

      if (props.IsNormalDefined()) {
        const normal = props.Normal()
        if (orientation === oc.TopAbs_Orientation.TopAbs_REVERSED) {
          normals.push(-normal.X(), -normal.Y(), -normal.Z())
        } else {
          normals.push(normal.X(), normal.Y(), normal.Z())
        }
      } else {
        // Default normal if not defined
        normals.push(0, 0, 1)
      }
    }

    indexOffset += nbNodes
    explorer.Next()
  }

  // Clean up OpenCascade objects
  progress.delete()
  mesher.delete()
  explorer.delete()
  shape.delete()
  reader.delete()

  // Create Three.js geometry
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setIndex(indices)

  // Compute additional properties
  geometry.computeBoundingBox()
  const boundingBox = geometry.boundingBox!.clone()
  const center = new THREE.Vector3()
  boundingBox.getCenter(center)

  return {
    geometry,
    boundingBox,
    center
  }
}

/**
 * Alternative: Use a simpler tessellation approach
 */
export function tessellateStepShape(shape: any): THREE.BufferGeometry {
  const oc = window.occt

  // Build mesh
  const builder = new oc.BRepBuilderAPI_Transform_2(shape, new oc.gp_Trsf_1(), true)
  const transformedShape = builder.Shape()

  // Create incremental mesh with finer tolerance
  const mesher = new oc.BRepMesh_IncrementalMesh_2(transformedShape, 0.001, false, 0.5, true)
  mesher.Perform(new oc.Message_ProgressRange_1())

  const vertices: number[] = []
  const indices: number[] = []

  // Extract faces
  let indexOffset = 0
  const faceExplorer = new oc.TopExp_Explorer_2(
    transformedShape,
    oc.TopAbs_ShapeEnum.TopAbs_FACE,
    oc.TopAbs_ShapeEnum.TopAbs_SHAPE
  )

  while (faceExplorer.More()) {
    const face = oc.TopoDS.Face_1(faceExplorer.Current())
    const location = new oc.TopLoc_Location_1()
    const triangulation = oc.BRep_Tool.Triangulation(face, location, 0)

    if (!triangulation.IsNull()) {
      const transformation = location.Transformation()

      // Add vertices
      for (let i = 1; i <= triangulation.NbNodes(); i++) {
        const node = triangulation.Node(i).Transformed(transformation)
        vertices.push(node.X(), node.Y(), node.Z())
      }

      // Add triangles
      for (let i = 1; i <= triangulation.NbTriangles(); i++) {
        const tri = triangulation.Triangle(i)
        indices.push(
          tri.Value(1) - 1 + indexOffset,
          tri.Value(2) - 1 + indexOffset,
          tri.Value(3) - 1 + indexOffset
        )
      }

      indexOffset += triangulation.NbNodes()
    }

    faceExplorer.Next()
  }

  // Clean up
  faceExplorer.delete()
  mesher.delete()
  builder.delete()

  // Create geometry
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()

  return geometry
}

/**
 * Load STEP file from URL and convert to geometry
 */
export async function loadStepFile(url: string): Promise<StepMeshResult> {
  // Ensure OpenCascade is initialized
  if (!window.occt) {
    await initializeOpenCascade()
  }

  // Fetch STEP file
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load STEP file: ${response.statusText}`)
  }

  const stepContent = await response.text()
  return parseStepToGeometry(stepContent)
}

/**
 * Create a default material for STEP models
 */
export function createStepMaterial(color: string = '#8b7355'): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.6,
    roughness: 0.4,
    side: THREE.DoubleSide,
    flatShading: false
  })
}