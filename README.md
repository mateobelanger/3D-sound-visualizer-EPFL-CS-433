## Our project in brief

We will generate an animated scene that helps to visualize an audio recording by breaking it into different frequency ranges and applying each range’s amplitude to the movement of an object in the scene. These objects can be, for example, a series of rectangular prisms that stretch proportionally to the amplitude.

![Soundbars](https://raw.githubusercontent.com/cicero-mt/cicero-mt.github.io/master/sound_bars_example.png)

## Goals and Deliverables

### Minimum implementation requirements

* 3D Music viewer base scene: We should have the scene’s background with all the cubes that will scale based on the music.
* Cubes scalability based on a pre-defined song: We will attach a small default song to the project. The cubes in the scenes should scale according to that song.
* Camera movement: The user should be able to move the camera around and to zoom.
* Cubes color: The cubes’ colors should change depending on their height or the frequency.
* Phong illumination: The scene should be lit using the Phong illumination model.

### Optionnal extensions

* Add movement to the scene along with the tempo of the song
* Dynamic music input: Allow users to upload an audio file and have our program generate the animation
* Varied Scenes: After creating the scene with rectangular prisms, we can apply the same frequency separation algorithm to the audio file and output a different scene. For example, colored spheres that grow accordingly, or lines that deform. We can also create a flat surface that deforms into mountains with proportionate height to the amplitude.
* Shadows: We can add shadows to the prisms or other objects in the scene

### Deliverables

#### Minimum

In the case of the minimum implementation requirements, we will deliver a video of our animation accompanying a pre-selected song that clearly demonstrates the prisms’ reactions to different frequencies at different amplitudes. Since our project is web-based, we will allow this animation to run interactively within the browser.

#### Extended

In the case of reaching the optional requirements, we will also include a method to input an audio file with options on selecting the desired scene to display.

## Ressources

* Course slides: The class concepts will be used so we will use the slides
* The Web Audio API: provides a powerful and versatile system for controlling audio on the Web, allowing developers to choose audio sources, add effects to audio,       create audio visualizations, apply spatial effects (such as panning) and much more.
* Previous assignments and their libraries (regl_1.3.13 & gl_matrix3.2.1)
