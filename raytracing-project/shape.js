/* Intersection structure:
 * t:        ray parameter (float), i.e. distance of intersection point to ray's origin
 * position: position (THREE.Vector3) of intersection point
 * normal:   normal (THREE.Vector3) of intersection point
 * material: material of the intersection object
 */
class Intersection {
	constructor() {
		this.t = 0;
		this.position = new THREE.Vector3();
		this.normal = new THREE.Vector3();
		this.material = null;
	}
	set(isect) {
		this.t = isect.t;
		this.position = isect.position;
		this.normal = isect.normal;
		this.material = isect.material;
	}
}

/* Plane shape
 * P0: a point (THREE.Vector3) that the plane passes through
 * n:  plane's normal (THREE.Vector3)
 */
class Plane {
	constructor(P0, n, material) {
		this.P0 = P0.clone();
		this.n = n.clone();
		this.n.normalize();
		this.material = material;
	}
	// Given ray and range [tmin,tmax], return intersection point.
	// Return null if no intersection.
	intersect(ray, tmin, tmax) {
		let temp = this.P0.clone();
		temp.sub(ray.o); // (P0-O)
		let denom = ray.d.dot(this.n); // d.n
		if(denom==0) { return null;	}
		let t = temp.dot(this.n)/denom; // (P0-O).n / d.n
		if(t<tmin || t>tmax) return null; // check range
		let isect = new Intersection();   // create intersection structure
		isect.t = t;
		isect.position = ray.pointAt(t);
		isect.normal = this.n;
		isect.material = this.material;
		return isect;
	}
}

/* Sphere shape
 * C: center of sphere (type THREE.Vector3)
 * r: radius
 */
class Sphere {
	constructor(C, r, material) {
		this.C = C.clone();
		this.r = r;
		this.r2 = r*r;
		this.material = material;
	}
	intersect(ray, tmin, tmax) {
// ===YOUR CODE STARTS HERE===
		const A = 1;
		let O_minus_C = ray.o.clone().sub(this.C.clone());
		const B = O_minus_C.clone().multiplyScalar(2).dot(ray.d.clone());
		const C = O_minus_C.clone().lengthSq() - Math.pow(this.r, 2);
		let delta = Math.pow(B, 2) - (4 * A * C);
		if (delta < 0) return null; //no intersection
		else{
			const t1 = (-B - Math.sqrt(delta)) / (2 * A);
			const t2 = (-B + Math.sqrt(delta)) / (2 * A);
			if(t1>tmin && t1<tmax) {
				let isect = new Intersection();
				isect.t = t1;
				isect.position = ray.pointAt(t1);
				isect.normal = ray.pointAt(t1).clone().sub(this.C).normalize();
				isect.material = this.material;
				return isect;
			}else if (t2>tmin && t2<tmax) {
				let isect = new Intersection();
				isect.t = t2;
				isect.position = ray.pointAt(t2);
				isect.normal = ray.pointAt(t2).clone().sub(this.C).normalize();
				isect.material = this.material;
				return isect;
			}else return null;
		}
// ---YOUR CODE ENDS HERE---
	}
}

class Triangle {
	/* P0, P1, P2: three vertices (type THREE.Vector3) that define the triangle
	 * n0, n1, n2: normal (type THREE.Vector3) of each vertex */
	constructor(P0, P1, P2, material, n0, n1, n2) {
		this.P0 = P0.clone();
		this.P1 = P1.clone();
		this.P2 = P2.clone();
		this.material = material;
		if(n0) this.n0 = n0.clone();
		if(n1) this.n1 = n1.clone();
		if(n2) this.n2 = n2.clone();

		// below you may pre-compute any variables that are needed for intersect function
		// such as the triangle normal etc.
// ===YOUR CODE STARTS HERE===

		// for matrix [a  b]
		//            [c  d]
		let determinant2x2 = function(matrix){
			const a = matrix[0][0];
			const b = matrix[0][1];
			const c = matrix[1][0];
			const d = matrix[1][1];
			return (a * d) - (b * c);
		}
		// for matrix [a  b  c]
		//            [d  e  f]
		//            [g  h  i]
		 this.determinant3x3 = function (matrix){
			const a = matrix[0][0];
			const b = matrix[0][1];
			const c = matrix[0][2];
			const d = matrix[1][0];
			const e = matrix[1][1];
			const f = matrix[1][2];
			const g = matrix[2][0];
			const h = matrix[2][1];
			const i = matrix[2][2];
			
			const efhi_matrix = [[e, f],
							   [h, i]];
			const dfgi_matrix = [[d, f],
							   [g, i]];
			const degh_matrix = [[d, e],
							   [g, h]];
			return a * determinant2x2(efhi_matrix) - b * determinant2x2(dfgi_matrix) + c * determinant2x2(degh_matrix)
		}

		this.P2_minus_P0 = this.P2.clone().sub(this.P0.clone());
		this.P2_minus_P1 = this.P2.clone().sub(this.P1.clone());
		
		// this.triangle_normal = this.P2_minus_P0.clone().cross(this.P2_minus_P1);

// ---YOUR CODE ENDS HERE---
	} 

	intersect(ray, tmin, tmax) {
// ===YOUR CODE STARTS HERE===
	let transpose = function(matrix){
		const a = matrix[0][0];
		const b = matrix[0][1];
		const c = matrix[0][2];
		const d = matrix[1][0];
		const e = matrix[1][1];
		const f = matrix[1][2];
		const g = matrix[2][0];
		const h = matrix[2][1];
		const i = matrix[2][2];
		return [[a,d,g], 
				[b,e,h],
				[c,f,i]];
	}
	const d_vector_array = ray.d.toArray();
	const P2_minus_P0_array = this.P2_minus_P0.toArray();
	const P2_minus_P1_array = this.P2_minus_P1.toArray();
	let P2_minus_O = this.P2.clone().sub(ray.o.clone());
	const P2_minus_O_array = P2_minus_O.toArray();
	let t, alpha, beta, gamma;
	const D = this.determinant3x3([d_vector_array, P2_minus_P0_array, P2_minus_P1_array]);
	const D1 = this.determinant3x3([P2_minus_O_array, P2_minus_P0_array, P2_minus_P1_array]);
	const D2 = this.determinant3x3([d_vector_array, P2_minus_O_array, P2_minus_P1_array]);
	const D3 = this.determinant3x3([d_vector_array, P2_minus_P0_array, P2_minus_O_array]);
	if (D == 0) return null;
	else {
		t = D1/D;
		alpha = D2/D;
		beta = D3/D;
		gamma = 1 - alpha - beta;
		if (alpha >= 0 && beta >= 0 && (t>tmin && t <tmax) && ((alpha + beta) <= 1)){
			let isect = new Intersection();
			isect.t = t;

			isect.position = ray.pointAt(t);
			isect.material = this.material;
			if (this.n0 && this.n1 && this.n2) {
				isect.normal = (this.n0.clone().multiplyScalar(alpha).add(this.n1.clone().multiplyScalar(beta)).add(this.n2.clone().multiplyScalar(gamma))).normalize();
			}else {
				isect.normal = this.P2_minus_P0.clone().cross(this.P2_minus_P1).normalize();
			}
			return isect;
		}
	}
// ---YOUR CODE ENDS HERE---
		return null;
	}
}

function shapeLoadOBJ(objstring, material, smoothnormal) {
	loadOBJFromString(objstring, function(mesh) { // callback function for non-blocking load
		if(smoothnormal) mesh.computeVertexNormals();
		for(let i=0;i<mesh.faces.length;i++) {
			let p0 = mesh.vertices[mesh.faces[i].a];
			let p1 = mesh.vertices[mesh.faces[i].b];
			let p2 = mesh.vertices[mesh.faces[i].c];
			if(smoothnormal) {
				let n0 = mesh.faces[i].vertexNormals[0];
				let n1 = mesh.faces[i].vertexNormals[1];
				let n2 = mesh.faces[i].vertexNormals[2];
				shapes.push(new Triangle(p0, p1, p2, material, n0, n1, n2));
			} else {
				shapes.push(new Triangle(p0, p1, p2, material));
			}
		}
	}, function() {}, function() {});
}

/* ========================================
 * You can define additional Shape classes,
 * as long as each implements intersect function.
 * ======================================== */
