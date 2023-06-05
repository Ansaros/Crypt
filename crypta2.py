import tkinter as tk
import tkinter.filedialog as filedialog
import hashlib
import binascii
import time

class HashProgram:
    def __init__(self, root):
        self.root = root
        self.root.title("Hash Program")
        self.root.configure(bg="#F0F0F0")

        # Create and configure the header label
        self.header_label = tk.Label(root, text="Select a file", font=("Arial", 12, "bold"), bg="#F0F0F0")
        self.header_label.pack(pady=10)

        # Create and configure the file label
        self.file_label = tk.Label(root, font=("Arial", 12, "bold"), bg="#F0F0F0")
        self.file_label.pack(pady=10)

        # Create and configure the upload button
        self.upload_button = tk.Button(root, text="Select File", font=("Arial", 12), command=self.upload_file, bg="#4CAF50", fg="white")
        self.upload_button.pack(pady=10)

        # Create and configure the repetition label and entry
        self.repetition_label = tk.Label(root, text="Number of Repetitions:", font=("Arial", 12), bg="#F0F0F0")
        self.repetition_label.pack()
        self.repetition_entry = tk.Entry(root, font=("Arial", 12))
        self.repetition_entry.pack()

        self.hash_values = {}
        self.hash_labels = {}
        self.time_labels = {}

        # Define the available hash algorithms
        self.hash_algorithms = {
            "CRC32": self.calculate_crc32,
            "MD5": hashlib.md5,
            "SHA-224": hashlib.sha224,
            "SHA-256": hashlib.sha256,
            "SHA-384": hashlib.sha384,
            "SHA-512": hashlib.sha512
        }

        # Create and configure labels for each hash algorithm
        for algorithm in self.hash_algorithms:
            self.hash_labels[algorithm] = tk.Label(root, text=f"{algorithm}: ", font=("Arial", 14, "bold"), bg="#F0F0F0")
            self.hash_labels[algorithm].pack()

            self.time_labels[algorithm] = tk.Label(root, text="Time: ", font=("Arial", 10), bg="#F0F0F0")
            self.time_labels[algorithm].pack()

        # Create and configure the compute button
        self.compute_button = tk.Button(root, text="Compute Hashes", font=("Arial", 12), command=self.compute_hashes, bg="#2196F3", fg="white", state=tk.DISABLED)
        self.compute_button.pack(pady=10)

        # Create and configure the clear button
        self.clear_button = tk.Button(root, text="Clear", font=("Arial", 12), command=self.clear_selection, bg="#F44336", fg="white")
        self.clear_button.pack(pady=10)

    def upload_file(self):
        # Open a file dialog to select a file
        file_path = filedialog.askopenfilename(filetypes=(("All Files", "*.*"), ("Text Files", "*.txt"), ("Image Files", "*.jpg;*.png")))
        if file_path:
            # Update the file label with the selected file path
            self.file_label.configure(text=f"Selected file: {file_path}")
            self.compute_button.configure(state=tk.NORMAL)

    def compute_hashes(self):
        # Get the selected file path and number of repetitions
        file_path = self.file_label.cget("text").split(": ")[1]
        repetitions = int(self.repetition_entry.get())
        
        with open(file_path, "rb") as file:
            data = file.read()

        for algorithm, hash_function in self.hash_algorithms.items():
            total_time = 0
            for _ in range(repetitions):
                # Measure the time taken to compute the hash
                start_time = time.time()
                if algorithm == "CRC32":
                    hash_value = hash_function(data)
                else:
                    hash_object = hash_function(data)
                    hash_value = hash_object.hexdigest()
                end_time = time.time()

                total_time += end_time - start_time

            # Calculate the average time taken for the current algorithm
            avg_time = total_time / repetitions

            # Update the hash value label and time label for the current algorithm
            self.hash_values[algorithm] = hash_value
            self.hash_labels[algorithm].configure(text=f"{algorithm}: {hash_value}", fg="black")
            self.time_labels[algorithm].configure(text=f"Avg Time: {avg_time:.6f} seconds")

        self.compute_button.configure(state=tk.DISABLED)

    def calculate_crc32(self, data):
        # Calculate the CRC32 hash value
        crc32_value = binascii.crc32(data) & 0xffffffff
        return "{:08x}".format(crc32_value)

    def clear_selection(self):
        # Reset the UI elements to their initial state
        self.file_label.configure(text="No file selected")
        self.compute_button.configure(state=tk.DISABLED)
        self.repetition_entry.delete(0, tk.END)
        for algorithm in self.hash_algorithms:
            self.hash_values[algorithm] = ""
            self.hash_labels[algorithm].configure(text=f"{algorithm}: ")
            self.time_labels[algorithm].configure(text="Time: ")

if __name__ == "__main__":
    # Create the Tkinter root window
    root = tk.Tk()
    root.geometry("400x600")
    root.configure(bg="#F0F0F0")
    
    # Create an instance of the HashProgram class
    hash_program = HashProgram(root)
    
    # Start the Tkinter event loop
    root.mainloop()
