import React from "react";
import {generateQuote, generateWord, getScore, getWPM, postScore} from "../../../../utils";
import {Box, Typography} from "@material-ui/core";
import {accentColor, LineGraph, TransitionsModal} from "../../components"
import {ArenaContainer} from "./ArenaContainer";

class Challenge extends React.Component {
  state = {
    index: 0,
    wordsToBeTyped: "",
    highlightedWord: "",
    wordOptions: {
      words50: true,
      words100: false,
      punctuation: false,
      quotes: true,
      seconds30: false,
      seconds60: false,
    },
    tracker: [],
    startTime: "",
    WPM: 0,
    accuracyPercent: 0,
    correctNum: 0,
    totalCharSeen: 0,
    timeLeft: 0,
    timer: null,
    score: 0,
    challengeFinished: false,
  };

  componentDidMount() {
    this.handleNewChallenge();
    document.addEventListener("keydown", this.handleCorrectKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleCorrectKeyDown);
  }

  countDown = () => {
    if (this.state.timeLeft > 0)
      this.setState({
        timer: setInterval(this.handleTimer, 1000),
        startTime: new Date(),
      });
  };

  handleTimer = () => {
    let seconds = this.state.timeLeft - 1;
    this.setState({timeLeft: seconds});
    if (seconds === 0) {
      clearInterval(this.state.timer);
      this.handleScoreCalc();
    }
  };

  handleNewChallenge = () => {
    const {minChar, maxChar} = this.props;
    let wordCount;
    this.state.wordOptions.words50 ? (wordCount = 50) : (wordCount = 100);
    const options = {wordCount, minChar, maxChar, ...this.state.wordOptions};
    let newWordsToBeTyped;

    if (options.quotes) {
      generateQuote().then((res) => {
        newWordsToBeTyped = res;
        this.handleNewWords(newWordsToBeTyped);
      });
    } else {
      generateWord(options).then((res) => {
        newWordsToBeTyped = res.join(" ");
        this.handleNewWords(newWordsToBeTyped);
      });
    }
  };

  handleNewWords(newWordsToBeTyped) {
    const beginning = newWordsToBeTyped.slice(0, this.state.index);
    const highlighted = newWordsToBeTyped[this.state.index];
    const end = newWordsToBeTyped.slice(
      this.state.index + 1,
      newWordsToBeTyped.length
    );

    const newHighlightedWord = (
      <Typography variant="inherit">
        <Box fontFamily="Monospace" fontSize="h5.fontSize">
          {beginning}
          <span
            style={{
              borderBottom: "2px solid #0099ff",
              whiteSpace: "break-spaces",
            }}
          >
            {highlighted}
          </span>
          {end}
        </Box>
      </Typography>
    );
    this.setState({
      wordsToBeTyped: newWordsToBeTyped,
      highlightedWord: newHighlightedWord,
    });
  }

  handleCorrectKeyDown = (e) => {
    e.preventDefault();
    const typedChar = e.key;
    const char = this.state.wordsToBeTyped[this.state.index];
    let accuracyPercent,
      WPM = "-",
      tracker = [{}],
      index;
    const matcher = /^[a-zA-Z0-9!?,.;:'"/\-#]$/;

    if (!typedChar.match(matcher) && typedChar !== 'Backspace' && typedChar !== ' ') return;

    if (this.state.challengeFinished) return;

    if (this.state.index === 0 && this.state.startTime === "") {
      if (
        this.state.wordOptions.seconds30 ||
        this.state.wordOptions.seconds60
      ) {
        this.countDown();
      } else this.setState({startTime: new Date()});
    } else WPM = this.handleWPMUpdater();

    if (typedChar === char) {
      tracker = [
        ...this.state.tracker,
        {char, correct: true, wordsPerMin: WPM},
      ];
      accuracyPercent = this.handleAccuracyUpdater(tracker);
    } else if (typedChar !== char && typedChar !== "Backspace") {
      tracker = [
        ...this.state.tracker,
        {char, correct: false, wordsPerMin: WPM},
      ];
      accuracyPercent = this.handleAccuracyUpdater(tracker);
    } else {
      tracker = [...this.state.tracker].slice(0, this.state.tracker.length - 1);
    }

    let highlighted;
    let end = "";
    if (e.key === "Backspace") {
      if (this.state.index === 0) return;
      highlighted = this.state.wordsToBeTyped[this.state.index - 1];
      if (this.state.index !== this.state.wordsToBeTyped.length) {
        end = this.state.wordsToBeTyped
          .slice(this.state.index - 1, this.state.wordsToBeTyped.length)
          .substring(1);
      }
      index = this.state.index - 1;
      accuracyPercent = this.handleAccuracyUpdater(tracker);
    } else {
      highlighted = this.state.wordsToBeTyped[this.state.index + 1];
      if (this.state.index !== this.state.wordsToBeTyped.length) {
        end = this.state.wordsToBeTyped.slice(
          this.state.index + 2,
          this.state.wordsToBeTyped.length
        );
      }
      if (this.state.index + 1 === this.state.wordsToBeTyped.length) {
        this.handleScoreCalc();

        return;
      }
      index = this.state.index + 1;
    }
    const highlightedWord = (
      <Typography variant="inherit">
        <Box fontFamily="Monospace" fontSize="h5.fontSize">
          {Object.values(tracker).map((i, index) => {
            return (
              <span
                key={index}
                style={{backgroundColor: i.correct ? "#a5d6a7" : "#ef9a9a"}}
              >
                {i.char}
              </span>
            );
          })}
          <span
            style={{
              borderBottom: `2px solid ${accentColor}`,
              whiteSpace: "break-spaces",
            }}
          >
            {highlighted}
          </span>
          {end}
        </Box>
      </Typography>
    );
    this.setState({accuracyPercent, WPM, tracker, index, highlightedWord});
  };

  handleAccuracyUpdater = (tracker) => {
    let correctNum = 0;
    let totalCharSeen = tracker.length;
    for (let i = 0; i < tracker.length; i++) {
      if (tracker[i].correct === true) {
        correctNum++;
      }
    }
    return Math.round((correctNum / totalCharSeen) * 100);
  };

  handleRefreshWords = () => {
    this.setState((prevState) => ({
      index: 0,
      wordsToBeTyped: "",
      highlightedWord: "",
      tracker: [],
      startTime: "",
      WPM: 0,
      timeLeft: prevState.wordOptions.seconds30
        ? 30
        : prevState.wordOptions.seconds60
          ? 60
          : 0,
    }));
    clearInterval(this.state.timer);
    this.handleNewChallenge();
    document.addEventListener("keydown", this.handleCorrectKeyDown);
  };

  handleWPMUpdater() {
    const time =
      (new Date().getTime() - this.state.startTime.getTime()) / 1000 / 60;
    const trackedLetters = this.state.tracker.filter((el) => el.correct);
    const correct = trackedLetters.length;
    const miss = this.state.tracker.length - correct;
    return getWPM(correct, miss, time);
  }

  handleScoreCalc() {
    document.removeEventListener("keydown", this.handleCorrectKeyDown);
    const time =
      (new Date().getTime() - this.state.startTime.getTime()) / 1000 / 60;
    const trackedLetters = this.state.tracker.filter((el) => el.correct);
    const correct = trackedLetters.length;
    const miss = this.state.tracker.length - correct;
    const accuracy = this.state.accuracyPercent;
    this.setState({
      score: getScore(correct, miss, time, accuracy),
      challengeFinished: true,
    });
    const highScore = this.state.WPM * this.state.accuracyPercent;
    const username = localStorage.getItem("user");
    postScore({
      highScore,
      username,
      wordsPerMin: this.state.WPM,
      accuracy: this.state.accuracyPercent
    }).catch(console.error);
  }

  handleTestAgain = () => {
    this.setState({challengeFinished: false});
    this.handleRefreshWords();
  };

  render() {
    return (
      <>
        <ArenaContainer
          challenge={this.state.highlightedWord}
          accuracy={this.state.accuracyPercent}
          wpm={this.state.WPM}
          timeLeft={this.state.timeLeft}
          selectedKey={this.state.wordsToBeTyped[this.state.index]}
        />
        <TransitionsModal
          open={this.state.challengeFinished}
          close={() => this.setState({challengeFinished: false})}
          wpm={this.state.WPM}
          accuracy={this.state.accuracyPercent}
          score={this.state.WPM * this.state.accuracyPercent}
          characters={this.state.index}
          wordOptions={this.state.wordOptions}
          handleTestAgain={() => this.handleTestAgain()}
          lineGraph={<LineGraph userData={this.state.tracker}/>}
        />
      </>
    );
  }
}

export default Challenge;
