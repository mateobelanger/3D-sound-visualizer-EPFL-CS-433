## Our project in brief

We will generate an animated scene that helps to visualize an audio recording by breaking it into different frequency ranges and applying each range’s amplitude to the movement of an object in the scene. These objects can be, for example, a series of rectangular prisms that stretch proportionally to the amplitude.

<div align="center">
<img src="https://raw.githubusercontent.com/cicero-mt/cicero-mt.github.io/master/sound_bars_example.png">
</div>

## Goals and Deliverables

### Minimum implementation requirements

* 3D Music viewer base scene: We should have the scene’s background with all the cubes that will scale based on the music.
* Cubes scalability based on a pre-defined song: We will attach a small default song to the project. The cubes in the scenes should scale according to that song.
* Fast fourrier transform algorithm implementation to group the frequencies associated to the audio file
* Camera movement: The user should be able to move the camera around and to zoom.
* Cubes color: The cubes’ colors should change depending on their height or the frequency.
* Phong illumination: The scene should be lit using the Phong illumination model.

### Optionnal extensions

* Add movement to the scene (on a time axis) along with the tempo of the song
* Dynamic music input: Allow users to upload an audio file and have our program generate the animation
* Varied Scenes: After creating the scene with rectangular prisms, we can apply the same frequency separation algorithm to the audio file and output a different scene. For example, colored spheres that grow accordingly, or lines that deform. We can also create a flat surface that deforms into mountains with proportionate height to the amplitude.
* Shadows: We can add shadows to the prisms or other objects in the scene

### Deliverables

#### Minimum

In the case of the minimum implementation requirements, we will deliver a video of our animation accompanying a pre-selected song that clearly demonstrates the prisms’ reactions to different frequencies at different amplitudes. Since our project is web-based, we will allow this animation to run interactively within the browser.

#### Extended

In the case of reaching the optional requirements, we will also include a method to input an audio file with options on selecting the desired scene to display.

## Milestone Report

#### Accomplishments Summary

* Started our project by using our progress from exercise 5.
* Replaced the solar system with a grid of 16x16 cubes.
* Added an audio player function
* Tested animation of cube based on sim_time
* Added the fast fourier transform algorithm
* Added the mathJS library for complex number calculations
* Affect the scale of each cube to the amplitude of a channel
* Change the cube color based on the scale
* Added bezier curve camera path.

#### Preliminary Results

<div align="center">
<img src="https://raw.githubusercontent.com/cicero-mt/cicero-mt.github.io/master/Milestone_Sound_Bars.png">
</div>

## Schedule

| Week      | Task        | Subtask | Assigned to |
|:-------------|:------------------|:------|
| 1 (24/04 -> 01/05) | Setup of the environment | :heavy_check_mark: Librairies configuration | Evan |
|                    |                          | :heavy_check_mark: Initial scene            | Evan |
| 2 (01/05 -> 08/05) | Scene items  | :heavy_check_mark: Cubes | Ulrich  |
|                    |              | :heavy_check_mark: Skybox | Ulrich |
|                    |              | :heavy_check_mark: Camera movement | Evan |
|                    | Data Model | :heavy_check_mark: Audio decomposition: fast fourrier transform implementation  | Mathieu |
|                    |            | :heavy_check_mark:Frequencies grouping and mapping (time series) | Mathieu |
| 3 (08/05 -> 15/05) | Animations | :heavy_check_mark: Cube's movements and colors | Ulrich |
|                    | Surface shading | :heavy_check_mark: Phong implementation | Evan |
|                    | Colors | :heavy_check_mark: Dynamic colors | Mathieu |
|                    | Website update | :heavy_check_mark: Milestone report update |  Mathieu  |
|                    | Performance issues | :heavy_check_mark: Being able to play the animation synchronized with the music | Mathieu |
| 4 (15/05 -> 2/05) | Extras | Interactive audio file upload  | Ulrich |
|                   | Extras | Dynamic shapes| Evan |
|                   | Extras | Shadow generation | Mathieu |
|                   | Cleaning | :heavy_check_mark: Cleaning the codebase for final submission | Mathieu |
| 5 (22/05 -> 26/05) | :heavy_check_mark: Video creation |  |  Evan  |
|                    | :heavy_check_mark: Website update |  |  Mathieu  |

## Ressources

* Course slides: The class concepts will be used so we will use the slides
* The Web Audio API: provides a powerful and versatile system for controlling audio on the Web, allowing developers to choose audio sources, add effects to audio,       create audio visualizations, apply spatial effects (such as panning) and much more.
* Previous assignments and their libraries (regl_1.3.13 & gl_matrix3.2.1)

## Final Report
### Abstract 
Our project originated from the idea of combining our passions for music and for computer science. In the context of computer graphics, this meant deconstructing an audio file using a Fourier transform and rendering a visual representation of the different frequencies. The end result is a web based animation of a pre-selected and pre-loaded mp3 file with cinematic bézier curve camera movement as well as free camera movement and play/pause functionality.

### Technical approach
A summary of your technical approach, techniques used, algorithms implemented, etc. (use references to papers or other resources for further detail). Highlight how your approach varied from the references used (did you implement a subset, or did you change or enhance anything), the unique decisions you made and why.
A description of problems encountered and how you tackled them. Please also document any failed experiments/efforts you made.

### Results

Your final images, animations, video of your system (whichever is relevant). You can include results that you think show off what you built but that you did not have time to go over on presentation day. If your project is amenable, consider implementing it in WebGL so that you can directly include a running demo in your final website-based report.

### Contributions

**Project developped by** 
[Evan Kirby McGregor](https://github.com/EKM224) - 
[Ulrich Dah](https://github.com/ulrichdah) -
[Mathieu Bélanger](https://github.com/cicero-mt)
