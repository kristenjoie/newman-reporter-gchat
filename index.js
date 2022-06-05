const prettyms = require('pretty-ms');
const fetch = require('node-fetch');

function GChatNewmanReporter(emitter, reporterOptions, collectionRunOptions) {

  const webhookUrl = reporterOptions.webhookUrl;
  const buildUrl = reporterOptions.buildUrl || '';
  const title = reporterOptions.title || '';

  if (!reporterOptions.webhookUrl) {
    console.error('Missing GChat Webhook Url');
    return;
  }

  emitter.on('done', (error, summary) => {
    if (error) {
      console.error('error in done')
      return;
    }
    let run = summary.run;

    let body = JSON.stringify(createCard(title, run.stats, run.timings, buildUrl))
    // console.log(body)
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: body,
    }).then((response) => {
        // console.log(response);
    });
  });

  function createCard(title, stats, timings, buildUrl) {
    const cardHeader = {
      title: title,
    };

    let arr = ['iterations', 'requests', 'testScripts', 'prerequestScripts', 'assertions'];
    let str = ''
    arr.forEach((element) => {
      str = str + `element: Total: ${stats[element].total}, Failed:${stats[element].failed}<br>`
    });

    const textWidget = {
      textParagraph: {
        text: `${str}<p>Total Duration: ${prettyms(timings.completed - timings.started)}</p>`
      },
    };

    const buttonWidget = {
      buttons: [
        {
          textButton: {
            text: 'GOTO BUILD',
            onClick: {
              openLink: {
                url: buildUrl,
              },
            },
          },
        },
      ],
    };

    const infoSection = { widgets: [textWidget, buttonWidget] };

    const cards = [{
      header: cardHeader,
      sections: [infoSection],
    }];
    return { cards: cards };
  }
}
module.exports = GChatNewmanReporter
