	var year = $(".yearNumber").val();
	var week = $(".weekNumber").val();	
	changeWeekOrYear();

	function changeWeekOrYear(){
		year = $(".yearNumber").val();
		week = $(".weekNumber").val();	
		populateTable(employeesLatestData);	
	}
	
	function editHarvestedAmount($this){
		var day = $this.parent()[0].className;
		var employee = $this.parent().parent()[0].className;
		$("." + employee + " ." + day + " input").toggleClass("hidden");
		$("." + employee + " ." + day + " i").toggleClass("hidden");
	}

	function fetchNewHarvestAmount($this, event){
		if(event.keyCode == 13){
			var day = $this.parent()[0].className;
			var employee = $this.parent().parent()[0].className;
			var value = event.target.value;
			saveHarvestedAmount(employee,day,value);
		}
	}

	function saveHarvestedAmount(employee,day,value){
		var update = {
			year: year,
			week: week,
			day: day,
			employee: employee,
			value: value
		}
		$.ajax({
			type: "POST",
			url:"/editharvest",
			data: update,
			success: function(err, response){
				fetchLatestEmployeesData()
				$("." + employee + " ." + day + " input").toggleClass("hidden");
				$("." + employee + " ." + day + " i").toggleClass("hidden");
			}
		})

	}

	function eraseHarvestedAmount(){
		$(".harvested").each(function(index,item){
			$(this).text("");
		})
	}

	function populateTableWithHarvestedAmount(employees){
		employees.forEach(function(employee){
			if(employee["production"]){
				if(employee["production"][year]){
					if(employee["production"][year][week]){
						var daysItHasData = Object.keys(employee["production"][year][week]);
						daysItHasData.forEach(function(day){
							var dataInEachDay = employee["production"][year][week][day]["data"];
							$("." + employee.name + " ." + day + " span").text(dataInEachDay)
						})
					}
				}
			}
		})
	}

	function populateTable(employees){
		eraseHarvestedAmount();
		populateTableWithHarvestedAmount(employees)
	}

	function fetchLatestEmployeesData(){
		$.ajax({
			type: "GET",
			url:"/employees",
			success: function(body){
				employeesLatestData = body;
				populateTable(body);
			}
		})
	}