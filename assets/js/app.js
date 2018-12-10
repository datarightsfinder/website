$(function () {
  // MOBILE MENU
  $('.mobile-menu').click(function (e) {
    e.preventDefault();

    $('.nav').toggleClass('active');
    $(this).toggleClass('active');

    if ($('.nav').is(':visible')) {
      $(this).text('Close');
    } else {
      $(this).text('Menu');
    }
  });

  // MOBILE SEARCH
  $('.mobile-search').click(function (e) {
    e.preventDefault();

    $('.small-search').fadeIn(250);
    $('.content').click(function (e) {
      e.stopPropagation();
      $('.small-search').fadeOut(50);
    });
  });

  // COLLAPSABLES
  $('.collapsable-content').hide();

  $('.collapsable li a.toggle').click(function (e) {
    e.preventDefault();

    $(this).parent().find('.collapsable-content').toggle();

    if ($(this).parent().find('.collapsable-content').is(':visible')) {
      $(this).addClass('bold');
    } else {
      $(this).removeClass('bold');
    }
  });

  // COPY TO CLIPBOARD
  $('.copy-to-clipboard').click(function (e) {
    e.preventDefault();

    var text = $(this).parent().parent().find('textarea').text();
    clipboard.writeText(text);

    $(this).text('Copied');
  });

  // MESSAGE TEMPLATES
  $('textarea').each(function (i, e) {
    $(e).text($(e).text().replace('{{name}}', orgName));
  });

  //EXPAND AND COLLAPSE DATA SECTIONS

  var toggleSectionsButton = document.getElementById("toggle_sections_button");
  toggleSectionsButton.addEventListener("click", function () {
    toggleSectionsButton.blur();

    if (toggleSectionsButton.classList.contains("sections_collapsed")) {

      var dataSections = document.getElementsByClassName("data_section");
      var dataSectionsArray = Array.from(dataSections);
      for (var index = 0; index < dataSectionsArray.length; index++) {
        var section = dataSectionsArray[index];
        section.setAttribute("open", "");
      }
      toggleSectionsButton.textContent = "Collapse all sections";
      toggleSectionsButton.classList.remove("sections_collapsed");
      toggleSectionsButton.classList.add("sections_expanded");
    } else if (toggleSectionsButton.classList.contains("sections_expanded")) {

      var dataSections = document.getElementsByClassName("data_section");
      var dataSectionsArray = Array.from(dataSections);
      for (var index = 0; index < dataSectionsArray.length; index++) {
        var section = dataSectionsArray[index];
        section.removeAttribute("open");
      }
      toggleSectionsButton.textContent = "Expand all sections";
      toggleSectionsButton.classList.remove("sections_expanded");
      toggleSectionsButton.classList.add("sections_collapsed");
    }
  });

});