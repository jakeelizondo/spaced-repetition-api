const { LinkedList } = require('../linked-list');

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },

  getWord(db, id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ id })
      .first();
  },

  createWordsLinkedList(items) {
    let LIST = new LinkedList();

    items.forEach((item) => LIST.insertLast(item));

    return LIST;
  },
  async fillLinkedList(db, language_id, list) {
    try {
      const words = await this.getLanguageWords(db, language_id);

      words.map((word) => list.insertLast(word));

      return list;
    } catch (error) {
      return error;
    }
  },
  async updateWordsFromList(db, wordsArray) {
    for (let i = 0; i < wordsArray.length; i++) {
      await db('word').where('id', '=', wordsArray[i].id).update(wordsArray[i]);
      console.log(
        db('word')
          .where('id', '=', wordsArray[i].id)
          .update(wordsArray[i])
          .toSQL()
      );
    }
    return;
  },

  async updateLanguageTotalScore(db, language) {
    await db('language').where({ user_id: language.user_id }).update(language);
  },
};

module.exports = LanguageService;
