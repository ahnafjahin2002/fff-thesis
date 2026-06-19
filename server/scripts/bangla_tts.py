import sys
import json
import os
import traceback

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"success": False, "error": "No input data"}))
            return
            
        req = json.loads(input_data)
        text = req.get('text')
        voice = req.get('voice', 'female')
        out_dir = req.get('outDir')
        filename = req.get('filename', 'output.wav')
        
        if not text or not out_dir:
            print(json.dumps({"success": False, "error": "Missing text or outDir"}))
            return
             
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, filename)

        from banglatts import BanglaTTS
        
        tts = BanglaTTS()
        # Call the instance directly which maps to __call__ in the library
        tts(text, filename=out_path, voice=voice)
             
        if os.path.exists(out_path):
            print(json.dumps({"success": True, "audioPath": out_path}))
        else:
            print(json.dumps({"success": False, "error": "Audio file was not created"}))

    except Exception as e:
        print(json.dumps({
            "success": False, 
            "error": str(e),
            "traceback": traceback.format_exc()
        }))

if __name__ == "__main__":
    main()
