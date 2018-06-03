$(function() {
  $("#form1").alpaca({
    "schemaSource": "/public/schema.json",
    "optionsSource": "/public/options.json",
    "postRender": function(form) {
      setupForm(form);
    }
  });

  // EVENT HANDLERS
  // Show form sections
  $("body").on("click", "legend", function(e) {
    e.preventDefault();

    var container = $(this).parent().parent();

    if (container.attr("data-open") === "true") {
      // Close
      container.attr("data-open", "false");

      $(this).parent().find(".form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right, legend").hide();
      $(this).parent().find("legend").eq(0).show();
    } else if (container.attr("data-open") === "false" || !container.attr("data-open")) {
      // Open
      container.attr("data-open", "true");

      $(this).parent().find(".form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right, legend").show();
    }
  });

  // Enable checkbox toggle style
  $("body").on("click", "input:checkbox, input:radio", function(e) {
    if ($(this).parent().parent().parent().hasClass("boolean-toggle")) {
      return;
    }

    $(this).parent().parent().parent().find(".radio").removeClass("active");
    $(this).parent().parent().toggleClass("active");

    setTimeout(function() {
      saveLocalStorage();
      refreshContributeForm();
    }, 200);
  });

  // Save form JSON to localStorage on keyup event
  $("body").on("keyup", "input, textarea", function(e) {
    saveLocalStorage();

    refreshContributeForm();
  });

  // Start again button
  $("#buttonStartAgain").click(function(e) {
    e.preventDefault();

    resetLocalStorage();
  });

  // Contribute buttons
  $(".contribute-buttons a").click(function(e) {
    // Ignore if required fills aren't filled out
    if ($("input[name=organisationInformation_companyName]").val() === "") {
      e.preventDefault();
      return;
    }

    // Remove any visible contribution methods
    $(".contribute-by").hide();

    // Show the selected contribution method
    if ($(this).text() === "GitHub") {
      e.preventDefault();
      $("#contribute-github").fadeIn(250);
    } else if ($(this).text() === "Email") {
      $("#contribute-email").fadeIn(250);
    }

    // Change visual button state
    $(".contribute-buttons a").removeClass("active");
    $(this).addClass("active");
  });

  // Boolean toggle
  $("body").on("click", ".boolean-toggle input:radio", function(e) {
    var targetCheckbox = $(this).parent().parent().parent()
                          .find("input:checkbox");
    var targetCheckboxOn = targetCheckbox.is(":checked");

    $(this).parent().parent().parent().children().removeClass("active");
    $(this).parent().parent().addClass("active");

    $(this).parent().parent().parent().find('input:radio').not(this)
      .prop("checked", false);

    if ($(this).val() === "true") {
      if (!targetCheckboxOn) {
        targetCheckbox.trigger("click");
      }
    } else {
      if (targetCheckboxOn) {
        targetCheckbox.trigger("click");
      }
    }

    setTimeout(function() {
      saveLocalStorage();
      refreshContributeForm();
    }, 200);
  });

  // FUNCTIONS
  function setupForm(form) {
    // Repopulate form with JSON from localStorage if exists
    var payload = localStorage.getItem("payload");

    if (payload) {
      payload = JSON.parse(payload);
      form.setValue(payload);
    }

    // Run setValue again after 200ms to fix array render error
    // More info: https://github.com/gitana/alpaca/issues/356
    setTimeout(function() {
      // Retry populated form fields
      form.setValue(payload);

      // Hide all fields
      $(".form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right").hide();

      // Show first field
      showFirstField();

      // Make legend titles clickable links
      $("#form1 legend").each(function(i, e) {
        // Ignore anything that isn't a top level legend
        if ($(e).parents().length !== 11) {
          return;
        }

        var text = $(e).text().trim();

        var a = $("<a>");
        a.attr("href", "#");
        a.text(text);

        $(e).empty().append(a);
      });

      // Radio selectors in Alpaca can't be used with boolean types and enum to
      // create yes/no toggles, so this makes our own using a checkbox
      var addToggle = [];

      $(".checkbox").each(function(i, e) {
        // Find where label-less checkboxes are
        var labelText = $(e).find("label").text().trim();

        if (labelText === "") {
          addToggle.push(e);
        }
      });

      addToggle.forEach(function(e, i) {
        $(e).hide();

        $(e).parent().addClass("boolean-toggle");

        var buttonYes = $("<div>");
        var buttonNo = $("<div>");
        buttonYes.addClass("alpaca-control").addClass("radio");
        buttonNo.addClass("alpaca-control").addClass("radio");

        var labelYes = $("<label>");
        var labelNo = $("<label>");
        labelYes.text("Yes");
        labelNo.text("No");

        var inputYes = $("<input>");
        var inputNo = $("<input>");
        inputYes.attr("type", "radio");
        inputYes.attr("value", "true");
        inputNo.attr("type", "radio");
        inputNo.attr("value", "false");

        if ($(e).find("input").prop("checked")) {
          inputYes.prop("checked", true);
        } else {
          inputNo.prop("checked", true);
        }

        labelYes.prepend(inputYes);
        labelNo.prepend(inputNo);

        buttonYes.append(labelYes);
        buttonNo.append(labelNo);

        $(e).parent().append(buttonYes);
        $(e).parent().append(buttonNo);
      });

      // Refresh contribute form
      if ($('input[name=organisationInformation_companyName]').val() !== "") {
        refreshContributeForm();
      }

      $("#form1 input:radio, #form1 input:checkbox").each(function(i, e) {
        if ($(e).prop("checked")) {
          $(e).parent().parent().addClass("active");
        }
      });

      createTextboxArrayForms();
    }, 200);
  }

  function createTextboxArrayForms() {
    $(".alpaca-array-toolbar").each(function(i, e) {
      if ($(e).find("input").length !== 0) {
        return;
      }

      var input = $("<input>");
      input.attr("type", "text");
      input.attr("id", "array-input-box" + i);
      input.addClass("array-input-box");
      input.attr("placeholder", "Enter a value and press return...");

      // var a = $("<a>");
      // a.attr("href", "#");
      // a.text("Add");

      $(e).append(input);
    });
  }

  $("body").on("keyup", ".array-input-box", function(e) {
    // TODO: Fix lag when adding a new item to the array

    if (e.keyCode === 13 && $(this).val().length > 0) {
      var value = $(this).val();
      var cachedParent = $(this).parent().parent();
      var cachedId = $(this).attr("id");

      $(this).parent().find(".alpaca-array-toolbar-action").trigger("click");

      setTimeout(function() {
        cachedParent.find("input.alpaca-control").last().val(value);
        refreshContributeForm();
        saveLocalStorage();
        createTextboxArrayForms();

        $('#' + cachedId).focus();
      }, 200);
    }
  });

  $("body").on("mouseup", ".alpaca-array-actionbar-action", function(e) {
    // TODO: Fix lag when removing an item in the array

    e.preventDefault();

    setTimeout(function() {
      createTextboxArrayForms();
      saveLocalStorage();
      refreshContributeForm();
    }, 200);
  });

  // Pressing tab and focusing on section opens it
  $("body").on("keyup", "#form1", function(e) {
    if (e.which === 9 && $(document.activeElement).parent().hasClass("alpaca-container-label")) {
      $(document.activeElement).trigger("click");
    }
  });

  function showFirstField() {
    $('[data-alpaca-container-item-name="organisationInformation"]')
      .find(".form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right")
      .show();

    $('[data-alpaca-container-item-name="organisationInformation"]')
      .attr("data-open", "true")
  }

  function saveLocalStorage() {
    // Skip if company name isn't filled out
    if ($("input[name=organisationInformation_companyName]").val() === "") {
      return;
    }

    // Get form contents
    var payload = $("#form1").alpaca("get").getValue();

    // Set "payload" localStorage var with form contents JSON
    localStorage.setItem("payload", JSON.stringify(payload));
  }

  function resetLocalStorage() {
    if (confirm("Are you sure?")) {
      localStorage.removeItem("payload");
      location.reload();
    }
  }

  function refreshContributeForm() {
    // Get JSON from form
    var payload = $("#form1").alpaca("get").getValue();

    // Enable buttons
    $(".contribute-buttons a").animate({ "opacity": 1 }, 250);

    // Show JSON in text area fields
    $(".generated-json").val(JSON.stringify(payload, null, 2));

    // Populate mailto: link for email contributions
    $(".contribute-buttons a").last().attr("href", "mailto:ian@projectsbyif.com?body=" + JSON.stringify(payload));

    // Populate fields with company name slugs
    var slugifiedOrgName = easySlugify($("input[name=organisationInformation_companyName]").val());

    $(".contribute-url-preview").attr("href", "/organisation" + slugifiedOrgName)
      .text("https://example.com/organisation/" + slugifiedOrgName);

    $(".contribute-filename").text(slugifiedOrgName);
  }

  // HELPERS
  function easySlugify(input) {
    return input.replace(/[.]/g, "").replace(/[\s+]/g, "-").toLowerCase();
  }
});
