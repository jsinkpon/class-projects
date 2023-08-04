/* CMPSCI 373 Homework 4: Subdivision Surfaces */

const panelSize = 600;
const fov = 35;
const aspect = 1;
let scene, renderer, camera, material, orbit, light, surface=null;
let nsubdiv = 0;

let coarseMesh = null;	// the original input triangle mesh
let currMesh = null;		// current triangle mesh

let flatShading = true;
let wireFrame = false;

let objStrings = [
	box_obj,
	ico_obj,
	torus_obj,
	twist_obj,
	combo_obj,
	pawn_obj,
	bunny_obj,
	head_obj,
	hand_obj,
	klein_obj
];

let objNames = [
	'box',
	'ico',
	'torus',
	'twist',
	'combo',
	'pawn',
	'bunny',
	'head',
	'hand',
	'klein'
];

function id(s) {return document.getElementById(s);}
function message(s) {id('msg').innerHTML=s;}

function subdivide() {
	let currVerts = currMesh.vertices;
	let currFaces = currMesh.faces;
	let newVerts = [];
	let newFaces = [];
	/* You can access the current mesh data through
	 * currVerts and currFaces arrays.
	 * Compute one round of Loop's subdivision and
	 * output to newVerts and newFaces arrays.
	 */
// ===YOUR CODE STARTS HERE===
	let vertices_DS = [];
	let edges_DS = new Map();
	for (let i = 0; i < currVerts.length; ++i){
		vertices_DS.push(null);
	}
	for (let i = 0; i < currFaces.length; ++i){
		let a = currFaces[i].a;
		let b = currFaces[i].b;
		let c = currFaces[i].c;
		if (vertices_DS[a] == null) {
			const new_set = new Set();
			vertices_DS[a] = new_set;
		}
		vertices_DS[a].add(b);
		vertices_DS[a].add(c);
		if (vertices_DS[b] == null) {
			const new_set = new Set();
			vertices_DS[b] = new_set;
		}
		vertices_DS[b].add(a);
		vertices_DS[b].add(c);
		if (vertices_DS[c] == null) {
			const new_set = new Set();
			vertices_DS[c] = new_set;
		}
		vertices_DS[c].add(a);
		vertices_DS[c].add(b);
		let key1 = [Math.min(a, b), Math.max(a, b)]; // a-b key
		let key2 = [Math.min(a, c), Math.max(a, c)]; // a-c key
		let key3 = [Math.min(b, c), Math.max(b, c)]; // b-c key
		edges_DS.set(key1.join('-'), {v0: key1[0], v1: key1[1]});
		edges_DS.set(key2.join('-'), {v0: key2[0], v1: key2[1]});
		edges_DS.set(key3.join('-'), {v0: key3[0], v1: key3[1]});
	}

	
	const ite = edges_DS.keys();
	for (let i = 0; i < edges_DS.size; ++i){
		let cur_key = ite.next().value;
		let edge_vert = cur_key.split("-");
		edge_vert = edge_vert.map(x => parseInt(x));
		let neighbors_first_vert = Array.from(vertices_DS[edge_vert[0]]);
		let neighbors_second_vert = Array.from(vertices_DS[edge_vert[1]]);
		let neighbors_indexes = neighbors_first_vert.filter(x => neighbors_second_vert.some(y => x == y));
		edges_DS.set(cur_key, {v0: edge_vert[0], v1: edge_vert[1], n0: neighbors_indexes[0], n1: neighbors_indexes[1], index: i});
	}

	const ite1 = edges_DS.values();
	for (let i = 0; i < edges_DS.size; ++i){
		let cur_edge_val = ite1.next().value;
		let x = (3/8) * currVerts[cur_edge_val.v0].x + (1/8) * currVerts[cur_edge_val.n0].x + (3/8) * currVerts[cur_edge_val.v1].x + (1/8) * currVerts[cur_edge_val.n1].x;
		let y = (3/8) * currVerts[cur_edge_val.v0].y + (1/8) * currVerts[cur_edge_val.n0].y + (3/8) * currVerts[cur_edge_val.v1].y + (1/8) * currVerts[cur_edge_val.n1].y;
		let z = (3/8) * currVerts[cur_edge_val.v0].z + (1/8) * currVerts[cur_edge_val.n0].z + (3/8) * currVerts[cur_edge_val.v1].z + (1/8) * currVerts[cur_edge_val.n1].z;
		let new_point = new THREE.Vector3(x, y, z);
		newVerts.push(new_point);
	}
	
	let num_new_verts = newVerts.length;

	for (let i = 0; i < vertices_DS.length; ++i){
		let vertices_arr = Array.from(vertices_DS[i]);
		let k = vertices_arr.length;
		let beta = (1/k) * ((5/8) - Math.pow(((3/8) + (1/4) * Math.cos((2 * Math.PI)/ k )), 2));
		let x = (1 - (k * beta)) * currVerts[i].x;
		let y = (1 - (k * beta)) * currVerts[i].y;
		let z = (1 - (k * beta)) * currVerts[i].z;
		for (let j = 0; j < k; ++j){
			x += beta * currVerts[vertices_arr[j]].x;
			y += beta * currVerts[vertices_arr[j]].y;
			z += beta * currVerts[vertices_arr[j]].z;
		}
		let new_point = new THREE.Vector3(x, y, z);
		newVerts.push(new_point);
	}
	
	for (let i = 0; i < currFaces.length; ++i){
		let old_a = currFaces[i].a;
		let old_b = currFaces[i].b;
		let old_c = currFaces[i].c;
		let a = num_new_verts + old_a; //updated a index
		let b = num_new_verts + old_b; // updated b
		let c = num_new_verts + old_c; // updated c
		let key1 = [Math.min(old_a, old_b), Math.max(old_a, old_b)].join('-'); // a-b key
		let key2 = [Math.min(old_a, old_c), Math.max(old_a, old_c)].join('-'); // a-c key
		let key3 = [Math.min(old_b, old_c), Math.max(old_b, old_c)].join('-'); // b-c key
		let t = edges_DS.get(key1).index; // index of edge created from a-b into newVerts
		let u = edges_DS.get(key2).index; // index of edge created from a-c into newVerts
		let v = edges_DS.get(key3).index; // index of edge created from b-c into newVerts
		let new_face1 = new THREE.Face3(a, t, u);
		let new_face2 = new THREE.Face3(t, b, v);
		let new_face3 = new THREE.Face3(u, v, c);
		let new_face4 = new THREE.Face3(t, v, u);
		newFaces.push(new_face1);
		newFaces.push(new_face2);
		newFaces.push(new_face3);
		newFaces.push(new_face4);
	}
	
// ---YOUR CODE ENDS HERE---
	/* Overwrite current mesh with newVerts and newFaces */
	currMesh.vertices = newVerts;
	currMesh.faces = newFaces;
	/* Update mesh drawing */
	updateSurfaces();
}

window.onload = function(e) {
	// create scene, camera, renderer and orbit controls
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100 );
	camera.position.set(-1, 1, 3);
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(panelSize, panelSize);
	renderer.setClearColor(0x202020);
	id('surface').appendChild(renderer.domElement);	// bind renderer to HTML div element
	orbit = new THREE.OrbitControls(camera, renderer.domElement);
	
	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(camera.position.x, camera.position.y, camera.position.z);	// right light
	scene.add(light);

	let amblight = new THREE.AmbientLight(0x202020);	// ambient light
	scene.add(amblight);
	
	// create materials
	material = new THREE.MeshPhongMaterial({color:0xCC8033, specular:0x101010, shininess: 50});
	
	// create current mesh object
	currMesh = new THREE.Geometry();
	
	// load first object
	loadOBJ(objStrings[0]);
}

function updateSurfaces() {
	currMesh.verticesNeedUpdate = true;
	currMesh.elementsNeedUpdate = true;
	currMesh.computeFaceNormals(); // compute face normals
	if(!flatShading) currMesh.computeVertexNormals(); // if smooth shading
	else currMesh.computeFlatVertexNormals(); // if flat shading
	
	if (surface!=null) {
		scene.remove(surface);	// remove old surface from scene
		surface.geometry.dispose();
		surface = null;
	}
	material.wireframe = wireFrame;
	surface = new THREE.Mesh(currMesh, material); // attach material to mesh
	scene.add(surface);
}

function loadOBJ(objstring) {
	loadOBJFromString(objstring, function(mesh) {
		coarseMesh = mesh;
		currMesh.vertices = mesh.vertices;
		currMesh.faces = mesh.faces;
		updateSurfaces();
		nsubdiv = 0;
	},
	function() {},
	function() {});
}

function onKeyDown(event) { // Key Press callback function
	switch(event.key) {
		case 'w':
		case 'W':
			wireFrame = !wireFrame;
			message(wireFrame ? 'wireframe rendering' : 'solid rendering');
			updateSurfaces();
			break;
		case 'f':
		case 'F':
			flatShading = !flatShading;
			message(flatShading ? 'flat shading' : 'smooth shading');
			updateSurfaces();
			break;
		case 's':
		case 'S':
		case ' ':
			if(nsubdiv>=5) {
				message('# subdivisions at maximum');
				break;
			}
			subdivide();
			nsubdiv++;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'e':
		case 'E':
			currMesh.vertices = coarseMesh.vertices;
			currMesh.faces = coarseMesh.faces;
			nsubdiv = 0;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'r':
		case 'R':
			orbit.reset();
			break;
			
	}
	if(event.key>='0' && event.key<='9') {
		let index = 9;
		if(event.key>'0')	index = event.key-'1';
		if(index<objStrings.length) {
			loadOBJ(objStrings[index]);
			message('loaded mesh '+objNames[index]);
		}
	}
}

window.addEventListener('keydown',  onKeyDown,  false);

function animate() {
	requestAnimationFrame( animate );
	//if(orbit) orbit.update();
	if(scene && camera)	{
		light.position.set(camera.position.x, camera.position.y, camera.position.z);
		renderer.render(scene, camera);
	}
}

animate();
