// src/components/QuizQuestions.ts

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;      // index of the correct option
  explanation?: string;       // optional explanation
}

export interface AllQuizData {
  [courseId: number]: Question[];
}

export const allQuizData: AllQuizData = {
  0: [
    {
      question: '1) What is a primary difference between a qubit and a classical bit?',
      options: [
        'A qubit can only be 0 or 1.',
        'A classical bit can be 0, 1, or both simultaneously.',
        'A qubit can be 0, 1, or a superposition of both.',
        'Classical bits are faster than qubits.',
      ],
      correctAnswer: 2,
      explanation:
        'Classical bits are limited to definite states (0 or 1), while qubits leverage superposition until measured.',
    },
    {
      question: '2) Quantum computing promises potential advantages over classical computing primarily in which tasks?',
      options: [
        'Word processing and spreadsheet calculations.',
        'Video streaming and web browsing.',
        'Simulating quantum systems, optimization, and cryptography.',
        'Storing large amounts of data.',
      ],
      correctAnswer: 2,
      explanation:
        'Quantum computers excel at problems intractable for classical machines, like molecular simulations or cryptanalysis.',
    },
    {
      question: '3) Which phenomenon allows two qubits to exhibit correlated results instantaneously?',
      options: [
        'Superposition',
        'Interference',
        'Entanglement',
        'Decoherence',
      ],
      correctAnswer: 2,
      explanation:
        'Entanglement links qubit states so measuring one immediately affects the other, regardless of distance.',
    },
    {
      question: '4) What happens when you measure a qubit in superposition?',
      options: [
        'It remains in superposition.',
        'It collapses to one of the basis states.',
        'It duplicates itself.',
        'It entangles with its environment.',
      ],
      correctAnswer: 2,
      explanation:
        'Measurement collapses the qubit’s superposition into a definite classical state, yielding one outcome.',
    },
  ],

  1: [
    {
      question: '1) What does the principle of superposition describe?',
      options: [
        'A quantum particle can only be in one location at a time.',
        'A qubit can exist in a combination of basis states simultaneously.',
        'Two particles linked regardless of distance.',
        'Measuring a system collapses its state.',
      ],
      correctAnswer: 1,
      explanation:
        'Superposition allows a quantum system to be in multiple states until an observation is made.',
    },
    {
      question: '2) Entanglement refers to:',
      options: [
        'Wave-like particle behavior.',
        'Particle-like wave behavior.',
        'Correlation between particles across distances.',
        'The process of measurement.',
      ],
      correctAnswer: 2,
      explanation:
        'Entangled particles have linked states such that measuring one instantly affects the other.',
    },
    {
      question: '3) Which principle states measurement affects a quantum system’s state?',
      options: [
        'Superposition',
        'Entanglement',
        'Measurement collapse',
        'Wave-particle duality',
      ],
      correctAnswer: 2,
      explanation:
        'Measurement collapse describes how observing a quantum system forces it into a definite state.',
    },
    {
      question: '4) Wave-particle duality means quantum objects can behave as:',
      options: [
        'Only waves.',
        'Only particles.',
        'Both waves and particles.',
        'Neither waves nor particles.',
      ],
      correctAnswer: 2,
      explanation:
        'Quantum entities exhibit both wave-like and particle-like properties depending on how they are measured.',
    },
  ],

  2: [
    {
      question: '1) What is the quantum equivalent of a classical logic gate?',
      options: ['A qubit', 'A quantum algorithm', 'A quantum gate', 'A quantum measurement'],
      correctAnswer: 2,
      explanation:
        'Quantum gates operate on qubits, analogous to how classical gates operate on bits.',
    },
    {
      question: '2) The Hadamard gate is used to:',
      options: [
        'Measure a qubit’s state.',
        'Entangle two qubits.',
        'Create an equal superposition.',
        'Flip a qubit’s state.',
      ],
      correctAnswer: 2,
      explanation:
        'Hadamard puts |0⟩ or |1⟩ into (|0⟩+|1⟩)/√2 superposition.',
    },
    {
      question: '3) What does a Pauli-X gate do?',
      options: [
        'Creates superposition.',
        'Flips the qubit state (|0⟩↔|1⟩).',
        'Measures phase.',
        'Entangles qubits.',
      ],
      correctAnswer: 1,
      explanation:
        'Pauli-X is the quantum NOT gate, toggling |0⟩ to |1⟩ and vice versa.',
    },
    {
      question: '4) A CNOT gate performs which action?',
      options: [
        'Flips control qubit unconditionally.',
        'Flips target qubit if control is |1⟩.',
        'Measures both qubits.',
        'Creates three-qubit GHZ states.',
      ],
      correctAnswer: 1,
      explanation:
        'CNOT flips the target qubit only when the control qubit is in the |1⟩ state.',
    },
  ],

  3: [
    {
      question: '1) In Qiskit, circuits are built using which object?',
      options: ['Qubit', 'Gate', 'QuantumCircuit', 'Simulator'],
      correctAnswer: 2,
      explanation:
        'QuantumCircuit is the core Qiskit class for constructing quantum circuits.',
    },
    {
      question: '2) IBM Quantum Experience allows you to:',
      options: [
        'Build classical circuits.',
        'Run quantum jobs on real hardware.',
        'Design semiconductor chips.',
        'Perform molecular modeling.',
      ],
      correctAnswer: 1,
      explanation:
        'IBM Quantum Experience gives access to simulators and real quantum devices.',
    },
    {
      question: '3) Transpilation in Qiskit is used to:',
      options: [
        'Visualize circuits.',
        'Optimize circuits for a backend.',
        'Measure qubits.',
        'Create entanglement.',
      ],
      correctAnswer: 1,
      explanation:
        'Transpilation rewrites circuits to match the topology and gate set of a specific hardware backend.',
    },
    {
      question: '4) A Qiskit simulator is useful for:',
      options: [
        'Testing circuits without real-hardware noise.',
        'Launching space rockets.',
        'Detecting qubit errors on hardware.',
        'Building classical neural networks.',
      ],
      correctAnswer: 0,
      explanation:
        'Simulators let you verify and debug quantum circuits in a noise-free environment.',
    },
  ],

  4: [
    {
      question: '1) Dirac notation uses what to denote states?',
      options: ['[ ]', '|⟩', '<>', '()'],
      correctAnswer: 1,
      explanation:
        'Kets like |ψ⟩ denote quantum states in Dirac notation.',
    },
    {
      question: '2) The Bloch sphere represents:',
      options: [
        'Classical bit values.',
        'A qubit’s state on a sphere.',
        'Energy levels of atoms.',
        'Photon polarization.',
      ],
      correctAnswer: 1,
      explanation:
        'The Bloch sphere is a geometric representation of an arbitrary qubit state.',
    },
    {
      question: '3) Hilbert space is:',
      options: [
        'A classical memory.',
        'A vector space for quantum states.',
        'A type of quantum gate.',
        'A measurement device.',
      ],
      correctAnswer: 1,
      explanation:
        'Quantum states are vectors in a complex inner-product space called Hilbert space.',
    },
    {
      question: '4) Complex amplitudes’ magnitudes squared give:',
      options: [
        'Phase information.',
        'Measurement probabilities.',
        'Energy values.',
        'Temperature data.',
      ],
      correctAnswer: 1,
      explanation:
        'The squared modulus of a quantum amplitude is the probability of that outcome.',
    },
  ],

  5: [
    {
      question: '1) BB84 is a protocol for:',
      options: [
        'Breaking RSA encryption.',
        'Quantum key distribution.',
        'Quantum teleportation.',
        'Quantum machine learning.',
      ],
      correctAnswer: 1,
      explanation:
        'BB84 is the first quantum key distribution protocol, ensuring secure key exchange.',
    },
    {
      question: '2) Post-quantum cryptography refers to:',
      options: [
        'Classical methods secure against quantum attacks.',
        'Encrypting quantum states.',
        'Teleporting encryption keys.',
        'None of the above.',
      ],
      correctAnswer: 0,
      explanation:
        'Post-quantum cryptography uses algorithms designed to resist quantum computer attacks.',
    },
    {
      question: '3) In QKD, eavesdropping is detected via:',
      options: [
        'Signal amplification.',
        'State disturbance.',
        'Noise suppression.',
        'Thermal fluctuations.',
      ],
      correctAnswer: 1,
      explanation:
        'Any measurement by an eavesdropper disturbs the quantum states, revealing their presence.',
    },
    {
      question: '4) Practical QKD systems often use:',
      options: [
        'Microwave signals.',
        'Polarized photons.',
        'Magnetic resonance.',
        'Neural networks.',
      ],
      correctAnswer: 1,
      explanation:
        'Polarized single photons carry quantum bits for secure key exchange in BB84 and similar protocols.',
    },
  ],

  6: [
    {
      question: '1) Adiabatic theorem ensures:',
      options: [
        'Instantaneous state changes.',
        'Evolution stays in ground state if slow.',
        'Random jumps between states.',
        'Measurement collapse.',
      ],
      correctAnswer: 1,
      explanation:
        'If a Hamiltonian changes slowly, the system remains in its instantaneous ground state.',
    },
    {
      question: '2) Quantum annealing solves problems by:',
      options: [
        'Rapid gate operations.',
        'Adiabatic evolution toward problem ground state.',
        'Classical optimization.',
        'Photon entanglement.',
      ],
      correctAnswer: 1,
      explanation:
        'Quantum annealing evolves the system from an easy initial Hamiltonian to one encoding the optimization problem.',
    },
    {
      question: '3) D-Wave systems use which model?',
      options: [
        'Gate-based quantum computing.',
        'Quantum annealing.',
        'Topological qubits.',
        'Optical lattices.',
      ],
      correctAnswer: 1,
      explanation:
        'D-Wave builds quantum annealers specifically designed for optimization via adiabatic quantum computing.',
    },
    {
      question: '4) A key advantage of quantum annealing is:',
      options: [
        'Error-free gates.',
        'Large-scale qubit entanglement.',
        'Direct encoding of optimization cost functions.',
        'Instant teleportation.',
      ],
      correctAnswer: 2,
      explanation:
        'Quantum annealing encodes optimization directly into a Hamiltonian, simplifying cost evaluation.',
    },
  ],

  7: [
    {
      question: '1) Phase estimation determines:',
      options: [
        'Eigenvalues of a unitary operator.',
        'Amplitude of a wave.',
        'Energy gap.',
        'Classical frequencies.',
      ],
      correctAnswer: 0,
      explanation:
        'Quantum phase estimation finds eigenvalues (phases) corresponding to eigenstates of a unitary.',
    },
    {
      question: '2) Hamiltonian simulation is used to:',
      options: [
        'Analyze classical circuits.',
        'Replicate quantum dynamics of molecules.',
        'Encrypt data.',
        'Measure qubits directly.',
      ],
      correctAnswer: 1,
      explanation:
        'Hamiltonian simulation reproduces the time evolution of quantum systems on a quantum computer.',
    },
    {
      question: '3) The Quantum Fourier Transform (QFT) provides:',
      options: [
        'Classical FFT.',
        'Exponential speedup for Fourier analysis.',
        'Error correction.',
        'Qubit measurement.',
      ],
      correctAnswer: 1,
      explanation:
        'QFT is the quantum analogue of the discrete Fourier transform, efficient on quantum hardware.',
    },
    {
      question: '4) Quantum signal processing algorithms often leverage:',
      options: [
        'Classical filter banks.',
        'Controlled-phase rotations.',
        'Optical tweezers.',
        'Neural nets.',
      ],
      correctAnswer: 1,
      explanation:
        'Controlled-phase rotations are used to implement spectral transformations in quantum signal processing.',
    },
  ],

  8: [
    {
      question: '1) Superconducting qubits typically operate at:',
      options: [
        'Room temperature.',
        'Millikelvin ranges.',
        'Liquid nitrogen temperatures.',
        'High vacuum only.',
      ],
      correctAnswer: 1,
      explanation:
        'Superconducting circuits require dilution refrigerators to reach millikelvin temperatures for coherence.',
    },
    {
      question: '2) Topological qubits aim to reduce:',
      options: [
        'Gate speed.',
        'Hardware size.',
        'Error rates via nonlocal encoding.',
        'Quantum parallelism.',
      ],
      correctAnswer: 2,
      explanation:
        'Topological qubits encode information in global states of the system, making them robust to local noise.',
    },
  ],
};
