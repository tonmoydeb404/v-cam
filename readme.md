![vCam Logo](icons/icon128.png)

# vCam - Virtual Webcam with Customization

vCam is a browser extension that creates a virtual webcam, allowing users to apply customizations such as enabling/disabling the camera, adjusting the aspect ratio, and controlling the zoom level.

## Features

- **Virtual Webcam**: vCam acts as a virtual camera that users can configure.
- **Enable/Disable Webcam**: Easily toggle the virtual camera on or off.
- **Aspect Ratio Selection**: Choose from Auto, Landscape (16:9), Portrait (9:16), or Square (1:1).
- **Zoom Control**: Adjust zoom level with a range slider.

## Installation

### For Chrome

1. Clone or download this repository.
2. Ensure `manifest.json` contains the content of `manifest-chrome.json`.
3. Open your browser and navigate to `chrome://extensions/`.
4. Enable **Developer Mode** (toggle in the top right corner).
5. Click **Load Unpacked** and select the extension folder.
6. The vCam extension should now be available in your browser.

### For Firefox

1. Clone or download this repository.
2. Replace `manifest.json` with the content of `manifest-firefox.json`.
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
4. Click **Load Temporary Add-on** and select `manifest.json`.
5. The vCam extension should now be available in Firefox.

For permanent installation in Firefox, package and sign the extension using the Mozilla Add-ons Developer Hub.

## Usage

1. Click on the vCam extension icon.
2. Adjust the settings as needed:
   - Toggle the **Enable** switch to turn the virtual camera on/off.
   - Select the desired **Aspect Ratio**.
   - Use the **Zoom** slider to zoom in or out.
3. After making changes, turn the camera off and back on, or refresh the page for the settings to take effect.

## Future Enhancements

- Add camera source selection option
- Add a preview window for real-time changes.
- Save user preferences between sessions.
- Additional camera settings such as brightness, contrast, and filters.

## Credits

This project is inspired by [spite/virtual-webcam](https://github.com/spite/virtual-webcam).

## License

This project is open-source and available under the MIT License.

---

### Contribute

Feel free to fork this repository and submit pull requests for improvements or new features!

## Developer Contact

- Website: [tonmoydeb.com](https://tonmoydeb.com)
- Email: [tonmoydeb404@gmail.com](mailto:tonmoydeb404@gmail.com)
