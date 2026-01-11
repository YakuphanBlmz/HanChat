
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.getcwd(), "src"))

try:
    from src.fun_analyzer import FunAnalyzer
    print("Successfully imported FunAnalyzer")
except Exception as e:
    print(f"Failed to import FunAnalyzer: {e}")
    sys.exit(1)

def test_analyzer():
    analyzer = FunAnalyzer()
    
    # Test 1: Random junk text
    print("\nTest 1: Analyzing junk text...")
    result = analyzer.analyze("This is not a whatsapp export.")
    
    if result and "stats" in result and "DEBUG" in result["participants"]:
        print("SUCCESS: Junk text returned DEBUG fallback.")
    else:
        print(f"FAILURE: Junk text returned: {result}")

    # Test 2: Valid text
    print("\nTest 2: Analyzing valid text...")
    valid_text = "19.04.2024 08:28 - Ahmet: Merhaba\n19.04.2024 08:29 - Mehmet: Selam"
    result_valid = analyzer.analyze(valid_text)
    
    if result_valid and "stats" in result_valid and "Ahmet" in result_valid["stats"]:
        print("SUCCESS: Valid text parsed correctly.")
    else:
        print(f"FAILURE: Valid text returned: {result_valid}")

if __name__ == "__main__":
    test_analyzer()
