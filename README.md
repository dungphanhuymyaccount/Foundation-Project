# Foundation-Project: Online job portal for student
# Files Shuffle 🔀 Script

This script shuffles all files in a desired folder.
## Table of Contents
- [Usage](#Usage)
- [Benefit](#Benefits)
- [Tutorial, demonstration](#tutorial-and-demonstration)
- [Contributing](#Sources)
- [release](#RELEASES)
- [notices](#Notices)
## Usage

This script shuffles files in a single folder. For instance, we have **1.mp3**, **2.mp4**, **3.png**. After shuffling, we will have **1.mp3** with the content from **2.mp4**, and the file has the wrong extension. Similarly, **2.mp4** now is **3.png** content and can't be opened, and so on.

## Benefits

- Easy shuffle files.
- Gain an easy ability to change a game's asset very quickly.
- Make privacies
- And more, based on your usage.

*Notices: Do not use this script to destroy someone's project and throw it publicly.Don't use this script in dangerous areas such as system32... If you get access is denied, then you might need to check for ownership*

## Tutorial and Demonstration

[Watch the Tutorial on YouTube](https://www.youtube.com/watch?v=PlXB3b-kXtk)
<a href="https://www.youtube.com/watch?v=PlXB3b-kXtk">
    <img src="https://img.youtube.com/vi/PlXB3b-kXtk/hqdefault.jpg" width="600" height="400" />
</a>
1. Prepare the script in RELEASE.
2. Put it somewhere if you want.
3. Prepare the folder you want to shuffle.
4. Open either CMD or PowerShell (recommended in where you put the script).
5. Run the command with perspective quotes and the script's path.

## Sources

1. Somewhere on Reddit or Quora (October 2022).
2. Chat GPT (December 12, 2023).
3. Google Bard (December 12, 2023).
4. Bing AI (December 12, 2023).

## RELEASES
[Download Latest Release](https://github.com/wikiepeidia/files-shuffle-script/releases)
### V0

- Build NO: 0.(10/2022)
- Ripped off Reddit/Quora/StackOverFlow (unknown, using copyleaks does not yield results-as expected).
- Slow when lots of files.
- consistencies: 90% (it can sometimes fail to move file)
- file name consisting of $, ! symbols will fail to suffle and cause more bugs.


### V2-RELEASE

- Build NO: 5.(12/12/2023)
- FIXED V2-BETA bugs.
- current BUG: it suffle the folder as well, *make sure there is NO folder inside where you suffle*

### V2.1
- Build number 6(12/12/23)
- Fixed V2-RELEASE bug.
- **This version is considered the best due to its speed and independence from other software.**
## BETA RELEASES:
- These versions may not achieve optimal performance and could pose a risk of data loss or errors. They are intended for debugging purposes only.
### V1-ALPHA
- Build number 1 (12/12/2023)
- Optimized by Chat GPT
- Shuffle speed improved by approximately 3-4 times
- Fails to "find files" and copy them to the destination

### V1-BETA
- Build number 2 (12/12/2023)
- Optimized by Chat GPT for the second time
- Added more DEBUG
- Still non-functional

### V1-Release Candidate
- Build number 3 (12/12/2023)
- Optimized by Google Bard and Bing AI due to issues with GPT
- Speed reduced by approximately 50% compared to V1-ALPHA
- STILL DOES NOT WORK
* This marks the end for the batch file script; transition to PowerShell for improved performance *

### V2-BETA
- Build number 4 (12/12/2023)
- Rewritten in PowerShell
- Speed improved by approximately 5-8 times compared to V0
- Does not place shuffled files into the current folder, except for one file
- All bugs from V0 have been fixed

### V2.2ALPHA
- Build number 23 (29/12/2023)
- Desperate attempt from Chat GPT to provide multi-core, parallel support
- Only shifts the files by 1, e.g., if we have 1.mp3, 2.mp3, 3.mp3, and 4.mp3, the first shuffle results in 4.mp3, 1.mp3, 2.mp3, 3.mp3. We want it to fully randomize.

### V2.2 BETA
- Build number 26 (29/12/2023)
- Speed can be significantly increased on low-end PCs/laptops by 1.5-2 times, but on high-end PCs, it is slower, for some reason?
- Shuffles files with random file names and extensions, such as 33liesll.rnx and tcrfwkaw.he5
### v2.2 release
- withthin just a few builds from github copilot, we now have a functional script that probably increase performance in old laptops and pcs. Please notice that it might be a negative effect on higher end pcs.
### V3- Python Development Builds
- Build numbers 28-37 (29/12/2023)
- These builds aimed to enhance performance further by utilizing GPU's cuda cores, but this feature was later removed.
- None of these builds are functional. It is a fact that Chat GPT automatically switched to Python after encountering several failed PowerShell builds.
- These builds did not meet the requirement of "no other software involved" and some even required additional libraries.
## Notices
### commons:
- All scripts are safe and will not harm your PC. If you have any concerns, feel free to ask the chat GPT.
- Using [beta](#beta-releases) version might result in loss /error in data, as well as bad performance.
- It is recommended to run cmd/powershell as an administrator, although it is not  necessary.
- Please note that antivirus software may interfere with this script. If any issues arise, you may need to disable the antivirus temporarily.
### Batch File Script:
- This script can be run in **PowerShell** as well.
- It may run very slowly when dealing with a large number of files, special characters in file names, and a large amount of text.
- It has the potential to consume a significant amount of disk space.
### Powersehll
- *Please run `Set-ExecutionPolicy -ExecutionPolicy bypass` (PS must admin) then press A if you never run PS scripts before.*
- *This script is guranteed to run when executed in the same folder as powershell (path is much different than cmd) and make sure that is should be `& '.\file.ps1' "PATH TO FOLDER"`*
- *You can apply file masks to avoid shuffling another file that has a different extension. For instance, if you are shuffling in a folder containing **.png** and **.wav** files, you can run `& '.\file.ps1' "PATH TO FOLDER" *.FILEEXTENSION` to do so.*
