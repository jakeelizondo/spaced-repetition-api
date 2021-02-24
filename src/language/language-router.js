const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const xss = require('xss');
const { LinkedList } = require('../linked-list');

const languageRouter = express.Router();
const jsonBodyParser = express.json();

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`,
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/', async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );

    res.json({
      language: req.language,
      words,
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/head', async (req, res, next) => {
  try {
    const word = await LanguageService.getWord(
      req.app.get('db'),
      req.language.head
    );

    const nextWord = {
      nextWord: word.original,
      totalScore: req.language.total_score,
      wordCorrectCount: word.correct_count,
      wordIncorrectCount: word.incorrect_count,
    };

    return res.status(200).json(nextWord);
  } catch (error) {
    next(error);
  }
});

languageRouter.post('/guess', jsonBodyParser, async (req, res, next) => {
  try {
    // get guess
    let { guess } = req.body;
    guess = xss(guess);

    if (!guess) {
      return res.status(400).json({ error: `Missing 'guess' in request body` });
    }
    // create and populate linked list with words in database
    const LL = new LinkedList();
    const wordsList = await LanguageService.fillLinkedList(
      req.app.get('db'),
      req.language.id,
      LL
    );

    // get the users language to track total score
    let language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id
    );

    // make an object with fields to track and next word
    let responseObj = {
      nextWord: wordsList.head.next.value.original,
      totalScore: language.total_score,
      wordCorrectCount: wordsList.head.next.value.correct_count,
      wordIncorrectCount: wordsList.head.next.value.incorrect_count,
      answer: wordsList.head.value.translation,
      isCorrect: false,
    };

    // compare the guess to the word at the current head of the list
    console.log(guess, wordsList.head.value.translation);
    if (guess === wordsList.head.value.translation) {
      // if correct, double head M value
      wordsList.head.value.memory_value *= 2;
      // update correct count
      wordsList.head.value.correct_count++;
      //update total score
      responseObj.totalScore++;
      language.total_score += 1;
      responseObj = { ...responseObj, isCorrect: true };
    } else {
      // if incorrect, reset M value
      wordsList.head.value.memory_value = 1;
      // update incorrect count
      wordsList.head.value.incorrect_count += 1;
    }
    // move head back M places in the list
    let M = wordsList.head.value.memory_value;

    //capture the head of list in a temp node
    let tempNode = wordsList.head;

    //update head of list to point to second item
    wordsList.head = tempNode.next;
    currNode = wordsList.head;
    M--;
    // walk through list to get to the spot to insert word
    while (M > 0 && currNode.next !== null) {
      currNode = currNode.next;
      M--;
    }
    tempNode.next = currNode.next;
    currNode.next = tempNode;

    // Get values out of new list and into an array
    let wordsArray = [];
    let listNode = wordsList.head;
    //update language head
    language.head = listNode.value.id;

    while (listNode) {
      wordsArray.push(listNode.value);
      listNode = listNode.next;
    }

    // Pass array of updated words into database to be updated
    LanguageService.updateWordsFromList(req.app.get('db'), wordsArray);
    // update total language score
    LanguageService.updateLanguageTotalScore(req.app.get('db'), language);

    return res.status(200).json(responseObj);
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
