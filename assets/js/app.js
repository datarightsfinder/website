$(function() {

  $("#form1").alpaca({
    "schemaSource": "/public/schema.json",
    "options": {
      "fields": {
        "organisationInformation": {
          "helperPosition": "above",
          "label": "About the organisation",
          "helper": ""
        },
        "organisationUrls": {
          "helperPosition": "above",
          "label": "What websites do they run?",
          "helper": "",
          "hideToolbarWithChildren": false,
          "toolbarSticky": true,
          "toolbarStyle": "link",
          "toolbarPosition": "bottom",
          "actionbarStyle": "right",
          "actionbar": {
            "actions": [
              { "action": "remove", "enabled": true },
              { "action": "add", "enabled": false },
              { "action": "up", "enabled": false },
              { "action": "down", "enabled": false }
            ]
          }
        },
        "privacyNoticeUrl": {
          "helperPosition": "above",
          "label": "Where is their privacy notice?",
          "helper": ""
        },
        "dataProtectionOfficer": {
          "helperPosition": "above",
          "label": "Who is their data protection officer?",
          "helper": ""
        },
        "dataProtectionRegister": {
          "helperPosition": "above",
          "label": "Is the organisation in a data protection register?",
          "helper": ""
        },
        "internationalTransfer": {
          "helperPosition": "above",
          "label": "How does the organisation protect data outside the EU?",
          "helper": "",
          "fields": {
            "dataProcessingAddendum": {
              "fields": {
                "type": {
                  "type": "radio",
                  "optionLabels": [
                    "Sign and return a form",
                    "Change a setting",
                    "Part of Terms of Service"
                  ],
                  "hideNone": true
                }
              }
            }
          }
        },
        "thirdParties": {
          "helperPosition": "above",
          "label": "What third parties does the organisation share data with?",
          "helper": "",
          "fields": {
            "list": {
              "hideToolbarWithChildren": false,
              "toolbarSticky": true,
              "toolbarStyle": "link",
              "toolbarPosition": "bottom",
              "actionbarStyle": "right",
              "actionbar": {
                "actions": [
                  { "action": "remove", "enabled": true },
                  { "action": "add", "enabled": false },
                  { "action": "up", "enabled": false },
                  { "action": "down", "enabled": false }
                ]
              }
            }
          }
        },
        "retentionRules": {
          "helperPosition": "above",
          "label": "How long does this organisation keep data for?",
          "helper": "",
          "fields": {
            "rules": {
              "hideToolbarWithChildren": false,
              "toolbarSticky": true,
              "toolbarStyle": "link",
              "toolbarPosition": "bottom",
              "actionbarStyle": "right",
              "actionbar": {
                "actions": [
                  { "action": "remove", "enabled": true },
                  { "action": "add", "enabled": false },
                  { "action": "up", "enabled": false },
                  { "action": "down", "enabled": false }
                ]
              }
            }
          }
        },
        "dataTypesCollected": {
          "helperPosition": "above",
          "label": "What categories of data do they collect?",
          "helper": "",
          "fields": {
            "list": {
              "type": "checkbox",
              "optionLabels": [ "Foo", "Bar", "Baz", "123", "456", "789" ]
            }
          }
        },
        "automatedDecisionMaking": {
          "helperPosition": "above",
          "label": "Do they use automated decision making?",
          "helper": ""
        },
        "complaintInformation": {
          "helperPosition": "above",
          "label": "Do they have information on how to make a complaint?",
          "helper": ""
        },
        "securityStandards": {
          "helperPosition": "above",
          "label": "Do they mention how they secure data?",
          "helper": ""
        },
        "lawfulBases": {
          "helperPosition": "above",
          "label": "What lawful bases do they use?",
          "helper": "",
          "fields": {
            "consent": {
              "label": "Consent"
            },
            "contract": {
              "label": "Contract"
            },
            "legalObligation": {
              "label": "Legal obligation"
            },
            "vitalInterests": {
              "label": "Vital interests"
            },
            "publicTask": {
              "label": "Public task"
            },
            "legitimateInterests": {
              "label": "Legitimate interests"
            }
          }
        },
        "rights": {
          "helperPosition": "above",
          "label": "How can you exercise your rights?",
          "helper": "",
          "fields": {
            "general": {
              "label": "General"
            },
            "rectification": {
              "label": "Right to rectification"
            },
            "erasure": {
              "label": "Right to erasure"
            },
            "restrictProcessing": {
              "label": "Right to restrict processing"
            },
            "dataPortability": {
              "label": "Right to data portability"
            },
            "object": {
              "label": "Right to object"
            },
            "automatedDecisionMaking": {
              "label": "Rights around automated decision making"
            }
          }
        }
      },
      "form": {
        "buttons": {

        }
      }
    },
    "postRender": function(c) {
      var pl = localStorage.getItem('payload');

      if (pl) {
        pl = JSON.parse(pl);
        c.setValue(pl);
      }

      // Run setValue again after 200ms to array render error
      // More info: https://github.com/gitana/alpaca/issues/356
      setTimeout(function() {
        c.setValue(pl);

        $('.form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right').hide();

        showFirstField();
      }, 200);

      $('#form1 legend').each(function(i, e) {
        var text = $(e).text().trim();

        if ($(e).parents().length !== 11) {
          return;
        }

        var a = $('<a>');
        a.attr('href', '#');
        a.text(text);

        $(e).empty().append(a);
      });

      $('.form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right').hide();

      $('body').on('click', 'legend', function(e) {
        e.preventDefault();

        $(this).parent().find('.form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right').show();

        $(this).parent().parent().css({ "height": "auto" });
      });

      populateSlugifiedFields();

      if ($('input[name=organisationInformation_companyName]').val() !== "") {
        $('.contribute-buttons a').animate({"opacity": 1}, 250);

        var payload = $("#form1").alpaca("get").getValue();

        $('.generated-json').val(JSON.stringify(payload, null, 2));

        $('.contribute-buttons a').last().attr("href", "mailto:ian@projectsbyif.com?body=" + JSON.stringify(payload));
      }
    }
  });

  // Enable checkbox toggle style
  $('body').on('click', 'input:checkbox', function(e) {
    $(this).parent().parent().toggleClass("active");
  });

  // Save to localStorage on keyup
  $('body').on('keyup', 'input', function(e) {
    var payload = $("#form1").alpaca("get").getValue();
    localStorage.setItem('payload', JSON.stringify(payload));

    if ($('input[name=organisationInformation_companyName]').val() === "") {
      return;
    }

    $('.contribute-buttons a').animate({ "opacity": 1 }, 250);

    populateSlugifiedFields();

    $('.generated-json').val(JSON.stringify(payload, null, 2));

    $('.contribute-buttons a').last().attr("href", "mailto:ian@projectsbyif.com?body=" + JSON.stringify(payload));
  });

  $('.contribute-buttons a').click(function(e) {
    if ($('input[name=organisationInformation_companyName]').val() === "") {
      e.preventDefault();
      return;
    }

    $('.contribute-by').hide();

    if ($(this).text() === "GitHub") {
      e.preventDefault();
      $('#contribute-github').fadeIn(250);
    } else if ($(this).text() === "Email") {
      $('#contribute-email').fadeIn(250);
    }

    $('.contribute-buttons a').removeClass('active');
    $(this).addClass('active');
  });

  // Start again button
  $('#buttonStartAgain').click(function(e) {
    e.preventDefault();

    if (confirm("Are you sure?")) {
      localStorage.removeItem('payload');
      location.reload();
    }
  });

  function showFirstField() {
    $('[data-alpaca-container-item-name="organisationInformation"]').find('.form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right').show();

    $('[data-alpaca-container-item-name="organisationInformation"]').css({ "height": "auto" });
  }

  function populateSlugifiedFields() {
    var slugifiedOrgName = easySlugify($('input[name=organisationInformation_companyName]').val());

    $('.contribute-url-preview').attr('href', '/organisation' + slugifiedOrgName);
    $('.contribute-url-preview').text("https://example.com/organisation/" + slugifiedOrgName);

    $('.contribute-filename').text(slugifiedOrgName);
  }

  function easySlugify(input) {
    return input.replace(/[.]/g, '').replace(/[\s+]/g, '-').toLowerCase();
  }
});
