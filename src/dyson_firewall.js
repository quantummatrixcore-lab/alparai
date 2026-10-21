import { pathToFileURL } from 'url';

class DysonFirewall {
    constructor(q = 97, n = 4, m = 10) {
        this.q = q; // Modulus for the finite field
        this.n = n; // Dimension of the secret vector
        this.m = m; // Number of equations
    }

    // Generate a random matrix of size rows x cols modulo q
    getRandomMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(Math.floor(Math.random() * this.q));
            }
            matrix.push(row);
        }
        return matrix;
    }

    // Generate a random vector of given length modulo q
    getRandomVector(len) {
        const vec = [];
        for (let i = 0; i < len; i++) {
            vec.push(Math.floor(Math.random() * this.q));
        }
        return vec;
    }

    // Generate a vector with small error values (e.g., -1, 0, 1) modulo q
    getSmallErrorVector(len) {
        const vec = [];
        for (let i = 0; i < len; i++) {
            const e = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            vec.push((e + this.q) % this.q);
        }
        return vec;
    }

    // Multiply Matrix A (m x n) by vector s (n)
    multiply(A, s) {
        const result = [];
        for (let i = 0; i < this.m; i++) {
            let sum = 0;
            for (let j = 0; j < this.n; j++) {
                sum = (sum + A[i][j] * s[j]) % this.q;
            }
            result.push(sum);
        }
        return result;
    }

    // Add two vectors modulo q
    add(v1, v2) {
        const result = [];
        for (let i = 0; i < v1.length; i++) {
            result.push((v1[i] + v2[i]) % this.q);
        }
        return result;
    }

    // Generate LWE Public and Private keys
    generateKeys() {
        // Secret key s
        const s = this.getRandomVector(this.n);
        
        // Matrix A (Public)
        const A = this.getRandomMatrix(this.m, this.n);
        
        // Error e (Secret, used for key generation)
        const e = this.getSmallErrorVector(this.m);

        // Calculate b = As + e
        const As = this.multiply(A, s);
        const b = this.add(As, e);

        return {
            publicKey: { A, b },
            privateKey: s
        };
    }
    
    // Authenticate by verifying that As and b are close (differ by small error)
    authenticate(publicKey, privateKey) {
        const As = this.multiply(publicKey.A, privateKey);
        
        let errorSum = 0;
        for (let i = 0; i < this.m; i++) {
            let diff = Math.abs(publicKey.b[i] - As[i]);
            if (diff > this.q / 2) {
                diff = this.q - diff; // Handle circular distance modulo q
            }
            errorSum += diff;
        }
        
        // We know max error per equation is 1, so max total error is m
        return errorSum <= this.m;
    }
}

export default DysonFirewall;

// For standalone test execution
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    console.log("Starting AlparAi Dyson Sphere (Lattice-Based Post-Quantum) Security Firewall Test...");
    const fw = new DysonFirewall();
    const keys = fw.generateKeys();
    const isAuth = fw.authenticate(keys.publicKey, keys.privateKey);
    const wrongKey = fw.getRandomVector(fw.n);
    const isAuthWrong = fw.authenticate(keys.publicKey, wrongKey);
    if (isAuth && !isAuthWrong) {
        console.log("✅ All Dyson Firewall post-quantum authentication checks passed.");
    } else {
        console.error("❌ Dyson Firewall check failed.");
        process.exit(1);
    }
}
