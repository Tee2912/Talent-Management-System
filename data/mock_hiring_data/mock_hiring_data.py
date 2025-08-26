# import statements
import random
import pandas as pd
from datetime import datetime, timedelta

source_channels = ["Michael Page", "Robert Walters", "Randstad", "LinkedIn", "Job Street", "Employee Referral"]
roles = [
	{"id": "MER0003", "title": "Data Science", "open": "2025-04-01"},
	{"id": "MER0009", "title": "Data Engineer", "open": "2025-04-01"},
	{"id": "MER0004", "title": "Full Stack Developer for AI", "open": "2025-05-02"},
	{"id": "MER0008", "title": "Full Stack Developer in Java", "open": "2025-05-10"},
	{"id": "MER0015", "title": "Full Stack Developer in Golang", "open": "2025-06-01"}
]

def random_name():
    ethnicity = random.choice(["chinese", "malay", "indian"])
    if ethnicity == "chinese":
        given = random.choice(["Wei Ling", "Jia Hao", "Mei Xin", "Li Wei", "Xin Yi", "Wai Jie", "Zhi Ming", "Xiao Mei", "Hui Min", "Liang Chen"])
        family = random.choice(["Tan", "Lim", "Lee", "Chong", "Goh", "Wong", "Chan", "Teoh", "Chew", "Liew"])
    elif ethnicity == "malay":
        given = random.choice(["Aiman", "Siti", "Farhan", "Nurul", "Hakimah", "Faizal", "Arif", "Zainab", "Aisyah", "Zara"])
        family = random.choice(["Abdullah", "Ismail", "Yusof", "Rahman", "Hashim", "Salleh", "Zainal", "Jamil", "Hassan", "Omar"])
    elif ethnicity == "indian":
        given = random.choice(["Kumar", "Priya", "Arun", "Deepa", "Vijay", "Chandra", "Anjali", "Yage", "Kavita", "Ravi"])
        family = random.choice(["Singh", "Raj", "Muniandy", "Nair", "Pillai", "Subramaniam", "Krishnan", "Ramasamy", "Kumar", "Vijay"])
    return f"{given} {family}"

def random_date(start, end):
	start_dt = datetime.strptime(start, "%Y-%m-%d")
	end_dt = datetime.strptime(end, "%Y-%m-%d")
	delta = end_dt - start_dt
	return (start_dt + timedelta(days=random.randint(0, delta.days))).strftime("%Y-%m-%d")

def generate_mock_hiring_data(n=100):
	data = []
	for i in range(n):
		role = random.choice(roles)
		candidate_id = f"MYC-{i+1:05d}"
		position_id = role["id"]
		role_title = role["title"]
		position_open_date = role["open"]
		position_close_date = random_date(position_open_date, "2025-08-15")
		candidate_name = random_name()
		source_channel = random.choice(source_channels)

		# CV received after open date
		stage_cv_received = random_date(position_open_date, position_close_date)
		# CV filtered 3-5 days after received
		cv_filtered_dt = datetime.strptime(stage_cv_received, "%Y-%m-%d") + timedelta(days=random.randint(3,5))
		stage_cv_filtered = cv_filtered_dt.strftime("%Y-%m-%d")

		# Bias CV scores upwards
		cv_result = f"{random.randint(30, 100)}%"
		cv_result_value = int(cv_result.replace('%',''))

		# Edge case: immediate rejection
		immediate_reject = random.random() < 0.05
		if immediate_reject or cv_result_value < 50:
			rejection_reason = random.choice([
				"Working experiences does not match requirement",
				"Lacking of required technical skills",
				"Lacking of leadership quality"
			])
		else:
			rejection_reason = ""

		# Test assigned/completed ONLY if CV > 50 and not immediate reject
		if not immediate_reject and cv_result_value > 50:
			test_assigned_dt = cv_filtered_dt + timedelta(days=random.randint(1,5))
			stage_test_assigned = test_assigned_dt.strftime("%Y-%m-%d")
			test_completed_dt = test_assigned_dt + timedelta(days=random.randint(1,14))
			stage_test_completed = test_completed_dt.strftime("%Y-%m-%d")

			# Bias test scores upwards
			test_score = random.randint(50,100)
			if test_score <= 40:
				test_result = "Failed"
			elif test_score <= 60:
				test_result = "Passed"
			elif test_score <= 80:
				test_result = "Good"
			else:
				test_result = "Perfect"

			# Interview scheduled/completed
			interview_scheduled = ""
			interview_completed = ""
			interview_result = ""
			offer_sent_date = ""
			offer_status = ""
			offer_rejection_reason = ""
			final_status = ""

			# Interview only if test_score > 80
			if test_score > 80:
				interview_scheduled_dt = test_completed_dt + timedelta(days=random.randint(1,7))
				interview_scheduled = interview_scheduled_dt.strftime("%Y-%m-%d")
				interview_completed_dt = interview_scheduled_dt + timedelta(days=random.randint(1,14))
				interview_completed = interview_completed_dt.strftime("%Y-%m-%d")

				#  Bias interview scores upwards
				interview_result_score = random.randint(60,100)
				interview_result = f"{interview_result_score}%"

				#  Offer only if interview > 80
				if interview_result_score > 80:
					delayed_offer = random.random() < 0.05
					offer_sent_dt = interview_completed_dt + timedelta(days=random.randint(1,30) if delayed_offer else random.randint(1,7))
					offer_sent_date = offer_sent_dt.strftime("%Y-%m-%d")

					#  Weighing offer acceptance
					offer_status = random.choices(["accept", "reject"], weights=[0.7, 0.3])[0]
					if offer_status == "reject":
						offer_rejection_reason = random.choice([
							"salary does not met expectation",
							"job scope does not met expectation",
							"working mode does not met expectation",
							"got another better offer elsewhere",
							"reject with family issues"
						])
						final_status = "rejected"   # only reject if candidate rejects offer
					else:
						final_status = "hired"     # hired only if accepted
				else:
					final_status = ""  # interview failed
					rejection_reason = "Interview score too low"
			else:
				final_status = ""   # failed in process
				rejection_reason = "Test score too low"
		else:
			stage_test_assigned = ""
			stage_test_completed = ""
			test_score = ""
			test_result = ""
			interview_scheduled = ""
			interview_completed = ""
			interview_result = ""
			offer_sent_date = ""
			offer_status = ""
			offer_rejection_reason = ""
			final_status = ""
		
		data.append({
			"Candidate_ID": candidate_id,
			"Position_ID": position_id,
			"Role_Title": role_title,
			"Position_Open_Date": position_open_date,
			"Position_Close_Date": position_close_date,
			"Candidate_Name": candidate_name,
			"Source_Channel": source_channel,
			"Stage_CV_Received": stage_cv_received,
			"Stage_CV_Filtered": stage_cv_filtered,
			"CV_Result": cv_result,
			"Stage_Test_Assigned": stage_test_assigned,
			"Stage_Test_Completed": stage_test_completed,
			"Test_Score": test_score,
			"Test_Result": test_result,
			"Stage_Interview_Scheduled": interview_scheduled,
			"Stage_Interview_Completed": interview_completed,
			"Interview_Result": interview_result,
			"Rejection_Reason": rejection_reason,
			"Offer_Sent_Date": offer_sent_date,
			"Offer_Status": offer_status,
			"Offer_Rejection_Reason": offer_rejection_reason,
			"Final_Status": final_status
		})
	return pd.DataFrame(data)

# Example usage:
df = generate_mock_hiring_data(100)
df.to_csv("mock_hiring_data.csv", index=False)

print(df["Final_Status"].value_counts())
