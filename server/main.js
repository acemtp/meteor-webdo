function onStartup() {
  Accounts.onCreateUser((options, user) => {
    const newUser = Object.assign({}, user);

    newUser.profile = options.profile ? options.profile : { name: options.username };

    if (user.services && user.services.google && user.services.google.picture)
      newUser.profile.avatar = user.services.google.picture;
    else
      newUser.profile.avatar = '';

    return newUser;
  });
}

function extractMeta(url) {
  try {
    const result = HTTP.call('GET', url);
    const meta = {};
    let m;

    if (result.statusCode !== 200) {
      console.log('bad status code', result.statusCode);
      return undefined;
    }

    let re = /<meta.*?(?:name|property)=['"](.*?)['"].*?content=['"](.*?)['"].*?>/gmi;
    while ((m = re.exec(result.content)) !== null) {
      if (m.index === re.lastIndex)
        re.lastIndex++;

//        console.log('m', m[1], m[2]);
      if (m[1] === 'description' || m[1] === 'og:description' || m[1] === 'twitter:description') meta.description = m[2];
      if (m[1] === 'og:image' || m[1] === 'twitter:image') meta.image = m[2];
      if (m[1] === 'og:title' || m[1] === 'twitter:title') meta.name = m[2];
    }

    re = /<title>(.*)<\/title>/gmi;
    while ((m = re.exec(result.content)) !== null) {
      if (m.index === re.lastIndex)
        re.lastIndex++;
//        console.log('tit', m[1], m[2]);
      meta.name = m[1];
    }

    console.log('meta', meta);
    return meta;
  } catch (e) {
    // Got a network error, time-out or HTTP error in the 400 or 500 range.
    console.log('err', e);
    return undefined;
  }
}

Meteor.startup(onStartup);

Meteor.methods({
  curExtractMeta(url) {
    check(url, String);
    this.unblock();
    const meta = extractMeta(url);
    if (!meta) throw new Meteor.Error('not meta extracted');
    return meta;
  },
});
