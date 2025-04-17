// src/components/QuizQuestions.ts

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation?: string; // Optional explanation for the correct answer
}

// Structure to hold quiz data for all courses, indexed by course ID
export interface AllQuizData {
  [courseId: number]: Question[];
}

// Define quiz data for each course ID
export const allQuizData: AllQuizData = {
  // --- Quiz for Course ID 0: Introduction to quantum computing ---
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
      explanation: 'Classical bits are limited to definite states (0 or 1), while qubits leverage quantum superposition to exist in a combination of states until measured.',
    },
    {
      question: '2) Quantum computing promises potential advantages over classical computing primarily in which types of tasks?',
      options: [
        'Word processing and spreadsheet calculations.',
        'Video streaming and web Browse.',
        'Simulating quantum systems, optimization problems, and cryptography.',
        'Storing large amounts of data.',
      ],
      correctAnswer: 2,
      explanation: 'Quantum computers excel at problems intractable for classical computers, such as simulating molecular interactions, breaking certain cryptographic codes, and solving complex optimization problems.',
    },
    // Add more questions for course 0 if needed...
  ],

  // --- Quiz for Course ID 1: Basic Quantum principles ---
  1: [
    {
      question: '1) What does the principle of superposition describe?',
      options: [
        'A quantum particle can only be in one location at a time.',
        'A qubit can exist in a combination of its basis states (0 and 1) simultaneously.',
        'Two quantum particles can be linked, regardless of distance.',
        'Measuring a quantum system collapses its state.',
      ],
      correctAnswer: 1,
      explanation: 'Superposition allows a quantum system, like a qubit, to be in multiple states at once, unlike classical systems which must be in a single definite state.'
    },
    {
      question: '2) Entanglement refers to:',
      options: [
        'The wave-like behavior of particles.',
        'The particle-like behavior of waves.',
        'A correlation between two or more quantum particles where their fates are linked, even when separated.',
        'The process of measuring a qubit.',
      ],
      correctAnswer: 2,
      explanation: 'Entanglement is a unique quantum phenomenon where particles become interconnected, and the state of one instantaneously influences the state of the other(s), no matter the distance separating them.'
    },
    // Add more questions for course 1 if needed...
  ],

  // --- Quiz for Course ID 2: Quantum Gates and Circuits (Basics) ---
  2: [
      {
          question: "1) What is the quantum equivalent of a classical logic gate?",
          options: [
              "A qubit",
              "A quantum algorithm",
              "A quantum gate",
              "A quantum measurement"
          ],
          correctAnswer: 2,
          explanation: "Quantum gates are operations applied to qubits, analogous to how classical logic gates operate on bits, forming the basis of quantum circuits."
      },
      {
          question: "2) The Hadamard gate is commonly used to:",
          options: [
              "Measure a qubit's state.",
              "Entangle two qubits.",
              "Put a qubit into an equal superposition of |0⟩ and |1⟩.",
              "Flip a qubit's state (like a NOT gate)."
          ],
          correctAnswer: 2,
          explanation: "Applying a Hadamard gate to a qubit initially in the |0⟩ or |1⟩ state transforms it into an equal superposition of both states."
      }
      // Add more questions for course 2 if needed...
  ],

  // Add entries for course IDs 3, 4, 5, 6, 7, 8... following the same pattern
  // Example for course 3 (replace with actual questions):
  3: [
      {
          question: "1) Which platform is commonly used for hands-on quantum programming?",
          options: [
              "Microsoft Excel",
              "Adobe Photoshop",
              "IBM Quantum Experience / Qiskit",
              "WordPress"
          ],
          correctAnswer: 2,
          explanation: "Platforms like IBM Quantum Experience and libraries like Qiskit allow users to build and run quantum circuits on simulators or real quantum hardware."
      },
       {
          question: "2) A quantum circuit diagram typically shows:",
          options: [
              "The physical layout of the quantum computer.",
              "The sequence of quantum gates applied to qubits over time.",
              "The energy levels of the qubits.",
              "The classical control electronics."
          ],
          correctAnswer: 1,
          explanation: "Quantum circuit diagrams represent the flow of quantum information, showing qubits as horizontal lines and quantum gates as operations applied to these lines."
      }
  ],
  // ... add quizzes for courses 4 through 8 ...
  4: [], // Add questions for Course 4
  5: [], // Add questions for Course 5
  6: [], // Add questions for Course 6
  7: [], // Add questions for Course 7
  8: [], // Add questions for Course 8

};