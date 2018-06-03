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

    $(this).parent().find(".form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right, legend").show();
  });

  // Enable checkbox toggle style
  $("body").on("click", "input:checkbox", function(e) {
    $(this).parent().parent().toggleClass("active");
  });

  // Save form JSON to localStorage on keyup event
  $("body").on("keyup", "input", function(e) {
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

      // Refresh contribute form
      if ($('input[name=organisationInformation_companyName]').val() !== "") {
        refreshContributeForm();
      }
    }, 200);
  }

  function showFirstField() {
    $('[data-alpaca-container-item-name="organisationInformation"]')
      .find(".form-group, .alpaca-array-toolbar, .alpaca-helper, .alpaca-array-actionbar, .pull-right")
      .show();

    $('[data-alpaca-container-item-name="organisationInformation"]')
      .css({ "height": "auto" });
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
