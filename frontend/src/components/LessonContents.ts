// src/data/LessonContents.ts

export interface ParagraphItem {
  text: string;
  type?: 'heading' | 'subheading' | 'paragraph'; // Default is 'paragraph'
}

export interface LessonContent {
  title: string;
  paragraphs: (string | ParagraphItem)[]; // Support both old string format and new object format
  interactiveTerms?: Record<string, string>;
}

export const lessonContents: Record<number, LessonContent> = {
  0: {
    title: 'Welcome to Quantum Computing',
    paragraphs: [
      'Quantum computing is a revolutionary technology that harnesses the principles of quantum mechanics to perform computations far beyond the capability of classical computers. These principles enable new ways of processing information that are fundamentally different from binary logic.',
      'Highlight any text to get options, or click underlined terms like qubit, superposition, and entanglement to learn more!',
      { text: 'Core Principles', type: 'heading' },
      'Qubits: Unlike classical bits, which are strictly 0 or 1, qubits can exist in a combination of both states simultaneously. This property, called superposition, provides quantum computers with unparalleled computational power for specific tasks.',
      'Superposition: Superposition enables a single qubit to represent multiple possibilities at once. For example, while a classical bit can only encode one number (0 or 1), a qubit in superposition can encode a combination of both. This property allows quantum computers to process many potential solutions simultaneously, exponentially increasing computational efficiency for some problems.',
      'Entanglement: Entanglement links two or more qubits such that the state of one immediately affects the state of the other, regardless of distance. This phenomenon forms the backbone of quantum communication and allows quantum computers to perform coordinated calculations across multiple qubits.',
      'Measurement: Measurement is the process of observing a qubit, which collapses its superposition into a definite state. This final state provides the result of a quantum computation, though the probabilistic nature of quantum mechanics means results may vary.',
      { text: 'Applications', type: 'heading' },
      'Cryptography: Quantum computers can break classical encryption methods, such as RSA, by efficiently factoring large numbers using algorithms like Shor\'s Algorithm. At the same time, they enable the creation of quantum-safe encryption methods, ensuring secure communication in the quantum era.',
      'Drug Discovery and Materials Science: By simulating molecular interactions at the quantum level, quantum computers can accelerate the discovery of new drugs and materials—critical for breakthroughs in medicine and materials science.',
      'Optimization: Many industries face optimization challenges—from supply chain logistics to portfolio management in finance. Quantum computers can evaluate multiple solutions simultaneously, offering potential speedups for finding optimal solutions.',
    ],
    interactiveTerms: {
      qubit:
        'A quantum bit (qubit) is the basic unit of quantum information. Unlike a classical bit, which must be 0 or 1, a qubit can be 0, 1, or any superposition of these states until measured.',
      superposition:
        'Superposition is a fundamental principle of quantum mechanics where a quantum system (like a qubit) can exist in multiple states at the same time. Only when measured does it collapse to a single definite outcome.',
      entanglement:
        'Entanglement is a quantum phenomenon where two or more qubits become linked such that measuring one instantly influences the state of the other, no matter the distance separating them.',
      measurement:
        'Measurement in quantum mechanics is the act of observing a quantum system. This observation forces the system to choose a definite classical state, collapsing any superposition.',
    },
  },
  1: {
    title: 'Basic Quantum Principles',
    paragraphs: [
      'In this lesson, we cover the foundational ideas that make quantum computing possible.',
      { text: 'Key Concepts', type: 'heading' },
      { text: 'Wave-Particle Duality', type: 'subheading' },
      'Quantum objects can behave both as particles and as waves, depending on how they are observed.',
      { text: 'Superposition', type: 'subheading' },
      'A qubit in superposition can exist in many possible states at once, enabling parallelism in computation.',
      { text: 'Entanglement', type: 'subheading' },
      'When qubits become entangled, their states are correlated in such a way that the measurement of one determines the state of the other instantly.',
      { text: 'Measurement Collapse', type: 'subheading' },
      'Observing a qubit forces it into one of its basis states, destroying its previous superposition.',
      { text: 'Applications', type: 'heading' },
      'These principles underpin advanced algorithms like Grover\'s search and quantum teleportation, which exploit superposition and entanglement for speedups.',
    ],
    interactiveTerms: {
      'wave-particle duality':
        'Wave-particle duality is the concept that every quantum entity exhibits both wave-like and particle-like properties.',
      superposition:
        'Superposition allows a qubit to be in a combination of the |0⟩ and |1⟩ states until measurement.',
      entanglement:
        'Entanglement links qubit states so that they cannot be described independently of each other.',
      'measurement collapse':
        'Measurement collapse is when observing a quantum system forces it into one definite state, ending superposition.',
    },
  },
  2: {
    title: 'Quantum Gates and Circuits (Basics)',
    paragraphs: [
      'Quantum gates are the building blocks of quantum algorithms, analogous to classical logic gates.',
      { text: 'Basic Gates', type: 'heading' },
      { text: 'Hadamard Gate (H)', type: 'subheading' },
      'Puts a single qubit into an equal superposition of |0⟩ and |1⟩.',
      { text: 'Pauli-X Gate', type: 'subheading' },
      'Flips the state of a qubit, analogous to a classical NOT gate.',
      { text: 'CNOT Gate', type: 'subheading' },
      'A two-qubit gate that flips the second qubit (target) if the first qubit (control) is |1⟩.',
      { text: 'Building Circuits', type: 'heading' },
      { text: 'Circuit Diagrams', type: 'subheading' },
      'Represent qubits as horizontal lines and gates as symbols placed on those lines in sequence.',
      'By combining gates, you can build complex quantum circuits to implement powerful algorithms.',
    ],
    interactiveTerms: {
      'Hadamard Gate':
        'The Hadamard gate creates equal superposition, mapping |0⟩ → (|0⟩+|1⟩)/√2 and |1⟩ → (|0⟩−|1⟩)/√2.',
      'Pauli-X Gate':
        'The Pauli-X gate acts like a NOT gate, flipping |0⟩ ↔ |1⟩ on a qubit.',
      CNOT:
        'The CNOT (Controlled NOT) gate flips the target qubit if the control qubit is in state |1⟩.',
      'Circuit Diagrams':
        'Quantum circuit diagrams visually depict the sequence of gates applied to qubits over time.',
    },
  },
  3: {
    title: 'Getting Hands-on',
    paragraphs: [
      'Now let\'s write some actual quantum code using Qiskit.',
      { text: 'Qiskit Framework', type: 'heading' },
      'Qiskit is an open-source Python framework for creating and running quantum circuits on simulators or real hardware.',
      { text: 'Core Components', type: 'subheading' },
      'QuantumCircuit Object: Build circuits by instantiating a QuantumCircuit and adding gates.',
      'Transpilation: Converts your high-level description into low-level instructions optimized for a given backend.',
      { text: 'Execution', type: 'subheading' },
      'Submit jobs to IBM Quantum simulators or real devices via the IBM Quantum Experience.',
      'Experiment with small circuits, view results, and analyze outcomes to deepen your understanding.',
    ],
    interactiveTerms: {
      Qiskit:
        'Qiskit is IBM\'s open-source SDK for working with quantum computers at the level of circuits, pulses, and algorithms.',
      'QuantumCircuit':
        'A QuantumCircuit object in Qiskit holds qubits, classical bits, and the sequence of gates to be executed.',
      'IBM Quantum Experience':
        'IBM Quantum Experience is a cloud platform where you can run quantum jobs on simulators and actual quantum processors.',
    },
  },
  4: {
    title: 'Foundations for Quantum Computing',
    paragraphs: [
      'This lesson dives into the math underpinning quantum theory.',
      { text: 'Mathematical Foundations', type: 'heading' },
      { text: 'Dirac Notation', type: 'subheading' },
      'Uses |ψ⟩ to denote quantum states and ⟨φ| for bra vectors.',
      { text: 'Hilbert Space', type: 'subheading' },
      'The vector space in which quantum states live, equipped with an inner product.',
      { text: 'Bloch Sphere', type: 'subheading' },
      'A geometric representation of the state of a single qubit on the surface of a sphere.',
      { text: 'Complex Amplitudes', type: 'subheading' },
      'Probability amplitudes are complex numbers whose magnitudes squared give measurement probabilities.',
      { text: 'Practical Applications', type: 'heading' },
      'Understanding these foundations will help you follow advanced algorithms and error-correction schemes.',
    ],
    interactiveTerms: {
      'Dirac Notation':
        'Dirac (bra-ket) notation succinctly represents quantum states: |ψ⟩ is a ket vector, ⟨ψ| is its dual bra.',
      'Bloch Sphere':
        'The Bloch sphere visually represents the state of a qubit as a point on or inside a unit sphere.',
    },
  },
  5: {
    title: 'Quantum Cryptography & Security',
    paragraphs: [
      'Quantum mechanics not only breaks classical cryptography but also enables new secure protocols.',
      { text: 'Quantum Key Distribution', type: 'heading' },
      { text: 'BB84 Protocol', type: 'subheading' },
      'Uses polarized photons to share encryption keys with guaranteed eavesdrop detection.',
      { text: 'QKD Implementation', type: 'subheading' },
      'Allows two parties to generate a shared, secret key with security based on physics.',
      { text: 'Classical Resistance', type: 'heading' },
      { text: 'Post-Quantum Cryptography', type: 'subheading' },
      'Classical algorithms designed to resist attacks by quantum computers.',
      { text: 'Current Applications', type: 'subheading' },
      'Fiber-optic and free-space QKD systems are already in use for secure communication.',
    ],
    interactiveTerms: {
      BB84:
        'BB84 is the first QKD protocol, using four polarization states of photons to establish secure keys.',
      'Quantum Key Distribution':
        'QKD enables two parties to share a secret key with security guaranteed by the laws of quantum mechanics.',
    },
  },
  6: {
    title: 'Adiabatic Quantum Computing',
    paragraphs: [
      'Adiabatic quantum computing encodes solutions to optimization problems in the ground state of a Hamiltonian.',
      { text: 'Theoretical Foundation', type: 'heading' },
      { text: 'Adiabatic Theorem', type: 'subheading' },
      'A quantum system remains in its instantaneous ground state if changes are sufficiently slow.',
      { text: 'Quantum Annealing', type: 'subheading' },
      'Slowly evolves the Hamiltonian from an easy initial form to one encoding the problem.',
      { text: 'Commercial Implementation', type: 'heading' },
      { text: 'D-Wave Systems', type: 'subheading' },
      'Commercial quantum annealers built by D-Wave implement quantum annealing on hundreds of qubits.',
      { text: 'Applications', type: 'subheading' },
      'Particularly suited for combinatorial optimization, scheduling, and materials modeling.',
    ],
    interactiveTerms: {
      'Adiabatic Theorem':
        'The adiabatic theorem states that a quantum system stays in its ground state when its Hamiltonian changes slowly enough.',
      'Quantum Annealing':
        'Quantum annealing leverages the adiabatic theorem to solve optimization problems by evolving toward a problem Hamiltonian.',
    },
  },
  7: {
    title: 'Quantum Signal Processing & Simulation',
    paragraphs: [
      'Quantum signal processing uses controlled quantum evolutions to perform spectral transformations.',
      { text: 'Core Algorithms', type: 'heading' },
      { text: 'Phase Estimation', type: 'subheading' },
      'Determines eigenvalues of a unitary operator, a key subroutine in many algorithms.',
      { text: 'Hamiltonian Simulation', type: 'subheading' },
      'Mimics the evolution of a quantum system under a given Hamiltonian.',
      { text: 'Transform Methods', type: 'heading' },
      { text: 'Quantum Fourier Transform (QFT)', type: 'subheading' },
      'The quantum analogue of the discrete Fourier transform with exponential speedup.',
      { text: 'Applications', type: 'subheading' },
      'Used in algorithms for chemistry, cryptanalysis, and solving linear systems of equations.',
    ],
    interactiveTerms: {
      'Phase Estimation':
        'Phase estimation finds the phase (eigenvalue) of an eigenstate of a unitary operator using interference.',
      'Hamiltonian Simulation':
        'Hamiltonian simulation reproduces the dynamics of a quantum system, enabling study of complex molecules on a quantum computer.',
    },
  },
  8: {
    title: 'Quantum Hardware & Future Trends',
    paragraphs: [
      'Quantum hardware is rapidly evolving, with multiple qubit modalities under development.',
      { text: 'Current Technologies', type: 'heading' },
      { text: 'Superconducting Qubits', type: 'subheading' },
      'Use Josephson junctions at millikelvin temperatures to encode quantum states.',
      { text: 'Trapped Ions', type: 'subheading' },
      'Individual ions confined by electromagnetic fields offer long coherence times.',
      { text: 'Emerging Technologies', type: 'heading' },
      { text: 'Topological Qubits', type: 'subheading' },
      'Aim to encode information in nonlocal properties of quasiparticles for built-in error resistance.',
      { text: 'Future Outlook', type: 'heading' },
      'Scaling up, error correction, and hybrid quantum-classical architectures will define the next decade.',
    ],
    interactiveTerms: {
      'Superconducting Qubits':
        'Superconducting qubits exploit superconductivity and Josephson junctions to create robust two-level systems.',
      'Topological Qubits':
        'Topological qubits store information in global properties of a system, making them inherently resistant to local noise.',
    },
  },
};