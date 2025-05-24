import pandas as pd


# Prediction function
def predict_average_match(teamA, teamB, df, model):
    result_df = get_team_df(teamA.upper(), teamB.upper(), df)
    X = result_df.drop(columns=["Team"])

    probs = model.predict_proba(X)[:, 1]
    probA = probs[0] / (probs[0] + probs[1])
    probB = probs[1] / (probs[0] + probs[1])

    winner = teamA if probA > probB else teamB

    return {
        "teamA": teamA,
        "teamB": teamB,
        "probability_teamA": round(probA, 2),
        "probability_teamB": round(probB, 2),
        "predicted_winner": winner,
    }


def get_team_df(teamA, teamB, df):
    columns_to_average = [
        "Pistol Rounds Won",
        "First Kills",
        "KAST",
        "Clutches",
        "Eco",
        "Semi-Eco",
        "Half-Buy",
        "Full-Buy",
        "+1",
        "-1",
        "0",
        "+2",
        "-2",
        "-3",
        "+3",
        "+4",
        "-4",
    ]

    columns_to_average_opp = [col + " Opp" for col in columns_to_average]

    team_rows_1 = df[df["Team"] == teamA]
    team_rows_2 = df[df["Team"] == teamB]

    if team_rows_1.empty or team_rows_2.empty:
        raise ValueError("One or both team names not found in the dataset.")

    mean_values_1 = team_rows_1[columns_to_average].mean()
    mean_values_2 = team_rows_2[columns_to_average].mean()

    final_columns = ["Team"] + columns_to_average + columns_to_average_opp

    row_1 = [teamA] + mean_values_1.tolist() + mean_values_2.tolist()
    row_2 = [teamB] + mean_values_2.tolist() + mean_values_1.tolist()

    return pd.DataFrame([row_1, row_2], columns=final_columns)
