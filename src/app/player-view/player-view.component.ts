import { Component, ViewChild, ElementRef } from '@angular/core';
// jsmediatags IS A LIBRARY THAT READS MEDIA TAGS
import * as jsmediatags from 'jsmediatags';
import { PictureType } from 'jsmediatags/types';

@Component({
  selector: 'app-player-view',
  templateUrl: './player-view.component.html',
  styleUrls: ['./player-view.component.css']
})
export class PlayerViewComponent {
  // ViewChild and ElementRef ARE AN ANGULAR WAYS TO WRAP AND REFER TO DOM ELEMENTS
  // USING DOM SELECTORS DIRECTLY IS NOT FOR ANGULAR
  @ViewChild("audio") audioElement!: ElementRef;
  @ViewChild("volume") volumeControl!: ElementRef;
  @ViewChild("progressBar") progressBar!: ElementRef;
  @ViewChild("cover") coverArt!: ElementRef;

  playing: boolean = false;
  duration: string = "0:00";
  currentTime: string = "0:00";

  info = {
    artist: "" as string,
    title: "" as string
  };

  // REFERRING TO THE ELEMENTS IN THE HANDLERS TO MAKE SURE THEY ARE INITIALIZED AND NOT NULL
  playPause(event: Event): void {
    const audioElement = this.audioElement.nativeElement;
    if (this.playing === false) {
      audioElement.play();
      this.playing = true;
    } else if (this.playing === true) {
      audioElement.pause();
      this.playing = false;
    };
  };

  changeVolume(): void {
    const volumeControl = this.volumeControl.nativeElement;
    const audioElement = this.audioElement.nativeElement;
    audioElement.volume = Number(volumeControl.value);
  }

  getMetadata(): void {
    const audioElement = this.audioElement.nativeElement;
    const progressBar = this.progressBar.nativeElement;
    const coverArt = this.coverArt.nativeElement;

    const duration = audioElement.duration;
    this.duration = this.parseTime(duration) as string;
    progressBar.max = duration;

    jsmediatags.read(audioElement.src, {
      onSuccess: (result) => {
        console.log(result);
        this.info.artist = result.tags.artist!;
        this.info.title = result.tags.title!;
        // APPARENTLY SOME FILES CONTAIN IMAGE DATA AS WELL
        // PARSING BELOW AS ADVISED BY AUTHORS OF THE LIBRARY
        const { data, format } = result.tags.picture!;
        let base64String = "";
        for (let i = 0; i < data.length; i++) {
          base64String += String.fromCharCode(data[i]);
        }
        coverArt.src = `data:${format};base64,${window.btoa(base64String)}`;
      },
      onError: (error) => {
        console.error(error);
      }
    });
  }

  updateTime(): void {
    const audioElement = this.audioElement.nativeElement;
    const progressBar = this.progressBar.nativeElement;
    const currentTime = audioElement.currentTime;
    this.currentTime = this.parseTime(currentTime) as string;
    progressBar.value = currentTime;
  }

  seek(event: MouseEvent): void {
    const audioElement = this.audioElement.nativeElement;
    const progressBar = this.progressBar.nativeElement;
    let newTime = event.offsetX / progressBar.offsetWidth * audioElement.duration;
    progressBar.value = newTime;
    audioElement.currentTime = newTime;
  }

  parseTime(totalSeconds: number): String {
    totalSeconds = Math.floor(totalSeconds);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
  }
}



  // audio(): void {
  //   const audioContext = new AudioContext();
  //   // ! NON-NULL ASSERTION OPERATOR TELLS TS THAT THE VALUE WILL NEVER BE NULL
  //   const audioElement = document.querySelector("audio")!;
  //   const track = audioContext.createMediaElementSource(audioElement);
  //   track.connect(audioContext.destination);

  //   const playButton = document.querySelector("button")!;

  //   playButton.addEventListener("click", function () {
  //     if (audioContext.state === "suspended") {
  //       audioContext.resume();
  //     };

  //     if (playButton.dataset["playing"] === "false") {
  //       audioElement.play();
  //       playButton.dataset["playing"] = "true";
  //     } else if (playButton.dataset["playing"] === "true") {
  //       audioElement.pause();
  //       playButton.dataset["playing"] = "false";
  //     };
  //   });

  //   audioElement.addEventListener("ended", function () {
  //     playButton.dataset["playing"] = "false";
  //   });

  //   // CONFUSING EXAMPLE FROM MDN DOCS RE GAIN - IT ACTUALLY IS NOT VOLUME
  //   const gainNode = audioContext.createGain();
  //   track.connect(gainNode).connect(audioContext.destination);

  //   const gainControl = (<HTMLInputElement>document.querySelector("#gain")!);

  //   gainControl.addEventListener("input", function () {
  //     gainNode.gain.value = Number(gainControl.value);
  //   });

  //   const volumeControl = (<HTMLInputElement>document.querySelector("#volume")!);

  //   volumeControl.addEventListener("input", function () {
  //     audioElement.volume = Number(volumeControl.value);
  //   });
  // }



// CAN REFACTOR BASED ON HTML MEDIA ELEMENT PROPERTIES https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
// AUDIO NODES ALLOW PROCESSING, MAY NEED THEM LATER FOR FADE OUT AND MIXING