function showErr(fieldId, msg) {
    if (!$(`#${fieldId}`).next(".err").length) {
        // check if no err after feildid to prevent dupliction of err
        $(`#${fieldId}`).after(`<span class="err text-danger">${msg}</span>`);
    } else {
        $(`#${fieldId}`).next(".err").text(msg);
    }
}

function clearErr(fieldId) {
    $(`#${fieldId}`).next(".err").remove();
}

function inputValidation(input) {
    let fieldId = input.attr("id");
    let val = input.val().trim();
    let isValid = true;

    switch (fieldId) {
        case "signupFirstName":
        case "signupLastName":
            let nameRegex = /^[a-zA-Z]+$/;
            if (!val) {
                showErr(fieldId, "this feild is required");
                isValid = false;
            } else if (!nameRegex.test(val)) {
                showErr(fieldId, "Name must contain only letters (no spaces)");
                isValid = false;
            } else if (val.length < 3 || val.length > 12) {
                showErr(fieldId, "name must be between 3 and 12 characters");
                isValid = false;
            } else {
                clearErr(fieldId);
            }
            break;
        case "signupEmail":
        case "signinEmail":
            let emailRegex =
                /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (!val) {
                showErr(fieldId, "Email is required");
                isValid = false;
            } else if (!emailRegex.test(val)) {
                showErr(fieldId, "Invalid email format");
                isValid = false;
            } else {
                clearErr(fieldId);
            }
            break;
        case "signupPassword":
        case "signinPassword":
            let passRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

            if (!val) {
                showErr(fieldId, "Password is required.");
                isValid = false;
            } else if (!passRegex.test(val)) {
                showErr(
                    fieldId,
                    "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one digit, and one special character."
                );
                isValid = false;
            } else {
                clearErr(fieldId);
            }
            break;
        case "signupConfirmPassword":
            const pass = $("#signupPassword").val().trim();
            if (!val) {
                showErr(fieldId, "Confirm Password is required");
                isValid = false;
            } else if (val !== pass) {
                showErr(fieldId, "password does not match");
                isValid = false;
            } else clearErr(fieldId);
            break;
    }
    return isValid;
}

function formValidation(form) {
    // form can be signin or signup
    $(".err").remove();
    let isValid = true;
    let inputs = {
        signup: [
            "#signupFirstName",
            "#signupLastName",
            "#signupEmail",
            "#signupPassword",
            "#signupConfirmPassword",
        ],
        signin: ["#signinEmail", "#signinPassword"],
    };

    inputs[form].forEach((input) => {
        isValid = isValid && inputValidation($(input)); // don't forget to pass it byid # so $(field)
    });
    return isValid;
}

///Saving user information
function saveUserData(firstName, lastName, userEmail, userPassword) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let isexist = false;
    users.forEach(function (user) {
        if (user.userEmail === userEmail) isexist = true;
    });
    if (!isexist) {
        users.push({
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            userEmail,
            userPassword,
        });
        localStorage.setItem("users", JSON.stringify(users));
    }
    return isexist;
}
//compare between sign in and signup
function inputsComparing(userEmail, userPassword) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let isValid = false;
    users.forEach(function (user) {
        if (user.userEmail === userEmail && user.userPassword === userPassword)
            isValid = true;
    });
    return isValid;
}

$(document).ready(function () {
    // Initially hide signup and signin sections
    $("#signup").hide();
    $("#signin").hide();

    // Show section based on button clicked
    $(".toggle-section").on("click", function (e) {
        e.preventDefault(); // Prevent default link behavior
        const targetSection = $(this).data("target");
        $("#hero").hide();
        $("#signup, #signin").hide();

        $(".err").remove(); // for remve err msg if i navigate between login and signup

        // for reseting forms
        $("#signupForm").trigger("reset");
        $("#signinForm").trigger("reset");
        $(targetSection).show();
    });

    // Validate data when exiting the field
    $("#signup input, #signin input").on("blur", function () {
        inputValidation($(this));
    });
    $("#signup form").on("submit", function (e) {
        e.preventDefault();
        if (formValidation("signup")) {
            //saving user information in local storage
            let firstName = $("#signupFirstName").val().trim();
            let lastName = $("#signupLastName").val().trim();
            let uEmail = $("#signupEmail").val().trim();
            let upass = $("#signupPassword").val().trim();
            saveUserData(firstName, lastName, uEmail, upass);

            Swal.fire({
                title: "Registeration Process success You Can Login Now",
                icon: "success",
                draggable: true,
            });
            $("#signup").hide();
            $("#signin").show();
        }

        // Trigger validation for all inputs to ensure errors are displayed
        $("#signup input").each(function () {
            inputValidation($(this));
        });
    });

    $("#signin form").on("submit", function (e) {
        e.preventDefault();
        if (formValidation("signin")) {
            let uEmail = $("#signinEmail").val().trim();
            let upass = $("#signinPassword").val().trim();
            let isValid = inputsComparing(uEmail, upass);

            if (isValid) {
                let users = JSON.parse(localStorage.getItem("users")) || [];
                let currentUser = users.find((u) => u.userEmail === uEmail);

                $("#nav-about-id").text(currentUser.fullName);

                $("#quiz-section").append(`
                <input type="hidden" id="currentUserName" value="${currentUser.fullName}">
            `);

                $("#signin").hide();
                $("#start-ex").show();
                Swal.fire({
                    title: "Login Successful!",
                    icon: "success",
                    draggable: true,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops! We couldn't find this user",
                });
            }
        } else {
            // Trigger validation for all inputs to ensure errors are displayed
            $("#signin input").each(function () {
                inputValidation($(this));
            });
        }
    });

    /**----------------quiz section -------------------- */
    $("#startEx").on("click", function (e) {
        $("#start-ex").hide();
        $("#quiz-section").show();

        // Reset all quiz-related variables
        let selectedQuestions = [];
        let currentIndex = 0;
        let userAnswers = {};
        let flaggedQuestions = {}; // Object to track flagged questions

        // Clear previous flagged questions list
        $("#flagged-list").empty();

        // Timer Logic
        const timer = document.getElementById("timer");
        let exCounter = 5 * 60; // five minutes
        const fullName = $("#currentUserName").val();

        // Clear any existing interval to prevent multiple timers
        if (window.quizInterval) {
            clearInterval(window.quizInterval);
        }

        window.quizInterval = setInterval(() => {
            let seconds = Math.floor(exCounter % 60);
            let minutes = Math.floor(exCounter / 60);
            if (exCounter < 30) {
                timer.style.color = "red";
            }
            if (exCounter <= 0) {
                let counter = 0;
                selectedQuestions.forEach(function (question, i) {
                    if (question.answer === userAnswers[i]) {
                        counter++;
                    }
                });

                timer.innerText = "00:00";
                clearInterval(window.quizInterval);
                // Go to the timeout page
                $("#timeout-span").text(`${counter * 10} %`);
                $("#timeout").show();
                $("#quiz-section").hide();
            }
            timer.innerText = `${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`;
            exCounter--;
        }, 1000);

        // Function to fetch data from API
        async function fetchData(apiLink) {
            try {
                const response = await fetch(apiLink);
                if (!response.ok) {
                    throw new Error("No Data Found");
                }
                const data = await response.json(); // Get all questions
                selectedQuestions = getRandomQuestions(data, 10); // Return random questions
                displayQuestion(); // Display the first question
            } catch (error) {
                console.error("Error:", error);
                return [];
            }
        }

        // Function to get random questions
        function getRandomQuestions(array, count) {
            const randomized = array.sort(() => 0.5 - Math.random());
            return randomized.slice(0, count);
        }

        // Function to display the current question
        function displayQuestion() {
            const question = selectedQuestions[currentIndex];
            $(".quiz-card h5").text(`${currentIndex + 1}. ${question.question}`); // Update question
            $(".form-check").each(function (i) {
                $(this)
                    .find("input")
                    .attr("value", `${String.fromCharCode(65 + i)}`);
                $(this)
                    .find("span")
                    .text(question[String.fromCharCode(65 + i)]);
            });

            // Restore previously selected answer
            $('input[name="answer"]').each(function () {
                $(this).prop(
                    "checked",
                    userAnswers[currentIndex] === $(this).attr("id").replace("option", "")
                );
            });

            // Check if the current question is flagged and update the flag button appearance
            if (flaggedQuestions[question.id]) {
                $("#flag").find("i").addClass("flag-red");
            } else {
                $("#flag").find("i").removeClass("flag-red");
            }

            // Disable navigation buttons if at the ends
            $(".quiz-nav[title='Go to Previous']").prop(
                "disabled",
                currentIndex === 0
            );
            $(".quiz-nav[title='Go to Next']").prop(
                "disabled",
                currentIndex === selectedQuestions.length - 1
            );
            $(".btn-submit").toggle(currentIndex === selectedQuestions.length - 1);
        }

        fetchData("questions.json");
        // Handle next/prev logic
        $(".quiz-nav").on("click", function () {
            const isNext = $(this).attr("title") === "Go to Next";
            if (isNext && currentIndex < selectedQuestions.length - 1) {
                currentIndex++;
            } else if (!isNext && currentIndex > 0) {
                currentIndex--;
            }

            displayQuestion();
        });

        // Handle flagging questions
        $("#flag")
            .off("click")
            .on("click", function () {
                let currQues = selectedQuestions[currentIndex]; // Get the current question
                const isFlagged = flaggedQuestions[currQues.id]; // Check if already flagged

                if (!isFlagged) {
                    // Add question to flagged list
                    flaggedQuestions[currQues.id] = true; // Mark as flagged
                    $("#flagged-list").append(`
                    <li id="flagged-${currQues.id}" class="fs-6 fs-sm-5">
                        Question ${currentIndex + 1}
                        <button class="btn btn-link text-danger remove-flag" title="Remove this question">
                            <i class="bi bi-trash"></i>
                        </button>
                    </li>
                `);
                    $(this).find("i").addClass("flag-red"); // Change flag button appearance
                } else {
                    // Remove question from flagged list
                    delete flaggedQuestions[currQues.id]; // Unmark as flagged
                    $(`#flagged-${currQues.id}`).remove();
                    $(this).find("i").removeClass("flag-red"); // Reset flag button appearance
                }
            });

        // Removing flagged questions
        $("#flagged-list").on("click", ".remove-flag", function () {
            const questionId = $(this).parent().attr("id").replace("flagged-", "");
            $(`#flagged-${questionId}`).remove(); // Remove question from flagged list
            delete flaggedQuestions[questionId]; // Unmark as flagged

            // Reset flag button state if the current question is unflagged
            if (selectedQuestions[currentIndex].id == questionId) {
                $("#flag").find("i").removeClass("flag-red");
            }
        });

        // Save user answers and update user answer
        $("input[name='answer']").on("change", function () {
            userAnswers[currentIndex] = this.id.replace("option", "");
        });

        // Handle submit logic
        $("#submit-btn").on("click", function (e) {
            e.preventDefault(); // Prevent default form submission
            let counter = 0;
            selectedQuestions.forEach(function (question, i) {
                if (question.answer === userAnswers[i]) {
                    counter++;
                }
            });

            // Get user name from hidden field
            const fullName = $("#currentUserName").val();

            if (counter >= 5) {
                $("#succes-res-span").text(`${counter * 10} %`);
                $("#succes-uname").text(`${fullName}`);
                $("#quiz-section").hide();
                $("#fail-res").hide();
                $("#start-ex").hide();
                $("#pass-res").show();

            } else {
                $("#fail-res-span").text(`${counter * 10} %`);
                $("#fail-uname").text(`${fullName}`);
                $("#quiz-section").hide();
                $("#pass-res").hide();
                $("#start-ex").hide();
                $("#fail-res").show();
            }
        });
    });

    //go to start exam when yser click on button
    $("#new-quiz-btn, #new-quiz-timer-btn, #new-quiz-fail-btn").on("click", function () {
        let target = $(this).data("target");
        $(target).hide();

        // Reset timer if it exists
        const timer = document.getElementById("timer");
        if (timer) {
            timer.innerText = "05:00";
            timer.style.color = "#581c87"; // Reset color if red
        }

        // Clear any existing interval
        if (window.quizInterval) {
            clearInterval(window.quizInterval);
        }
        $("#fail-res").hide();
        $("#pass-res").hide();
        $("#start-ex").show();
    });
});
