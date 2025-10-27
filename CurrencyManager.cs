using UnityEngine;
using UnityEngine.UI;
using System;

public class CurrencyManager : MonoBehaviour
{
    [Header("Currency Settings")]
    public int startingCoins = 100;
    public int startingStars = 0;
    
    [Header("Reward Settings")]
    public int coinsPerEasyWin = 10;
    public int coinsPerMediumWin = 20;
    public int coinsPerHardWin = 30;
    public int coinsPerTournamentWin = 50;
    
    [Header("UI References")]
    public Text coinsDisplayText;
    public Text starsDisplayText;
    
    private int currentCoins;
    private int currentStars;
    
    public static event Action<int> OnCoinsChanged;
    public static event Action<int> OnStarsChanged;
    
    private static CurrencyManager instance;
    public static CurrencyManager Instance
    {
        get
        {
            if (instance == null)
                instance = FindObjectOfType<CurrencyManager>();
            return instance;
        }
    }
    
    void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else if (instance != this)
        {
            Destroy(gameObject);
            return;
        }
        
        LoadCurrency();
    }
    
    void Start()
    {
        UpdateUI();
    }
    
    void LoadCurrency()
    {
        currentCoins = PlayerPrefs.GetInt("PlayerCoins", startingCoins);
        currentStars = PlayerPrefs.GetInt("PlayerStars", startingStars);
    }
    
    void SaveCurrency()
    {
        PlayerPrefs.SetInt("PlayerCoins", currentCoins);
        PlayerPrefs.SetInt("PlayerStars", currentStars);
        PlayerPrefs.Save();
    }
    
    public int GetCoins()
    {
        return currentCoins;
    }
    
    public int GetStars()
    {
        return currentStars;
    }
    
    public bool SpendCoins(int amount)
    {
        if (currentCoins >= amount)
        {
            currentCoins -= amount;
            SaveCurrency();
            UpdateUI();
            OnCoinsChanged?.Invoke(currentCoins);
            return true;
        }
        return false;
    }
    
    public void AddCoins(int amount)
    {
        currentCoins += amount;
        SaveCurrency();
        UpdateUI();
        OnCoinsChanged?.Invoke(currentCoins);
        
        // Show coin gain effect
        ShowCurrencyGainEffect(amount, CurrencyType.Coins);
    }
    
    public void AddStars(int amount)
    {
        currentStars += amount;
        SaveCurrency();
        UpdateUI();
        OnStarsChanged?.Invoke(currentStars);
        
        // Show star gain effect
        ShowCurrencyGainEffect(amount, CurrencyType.Stars);
    }
    
    public void RewardMatchVictory(GameDifficulty difficulty, GameMode mode)
    {
        int coinsReward = CalculateCoinsReward(difficulty, mode);
        int starsReward = CalculateStarsReward(difficulty, mode);
        
        AddCoins(coinsReward);
        if (starsReward > 0)
            AddStars(starsReward);
        
        // Show victory reward popup
        ShowVictoryReward(coinsReward, starsReward);
    }
    
    int CalculateCoinsReward(GameDifficulty difficulty, GameMode mode)
    {
        int baseReward = 0;
        
        switch (difficulty)
        {
            case GameDifficulty.Easy:
                baseReward = coinsPerEasyWin;
                break;
            case GameDifficulty.Medium:
                baseReward = coinsPerMediumWin;
                break;
            case GameDifficulty.Hard:
                baseReward = coinsPerHardWin;
                break;
        }
        
        // Bonus for special modes
        switch (mode)
        {
            case GameMode.Tournament:
                baseReward = coinsPerTournamentWin;
                break;
            case GameMode.MultiBall:
                baseReward = Mathf.RoundToInt(baseReward * 1.5f);
                break;
            case GameMode.TimeAttack:
                baseReward = Mathf.RoundToInt(baseReward * 1.2f);
                break;
        }
        
        return baseReward;
    }
    
    int CalculateStarsReward(GameDifficulty difficulty, GameMode mode)
    {
        // Stars are only awarded for hard difficulty or tournaments
        if (difficulty == GameDifficulty.Hard || mode == GameMode.Tournament)
        {
            return 1;
        }
        return 0;
    }
    
    void UpdateUI()
    {
        if (coinsDisplayText != null)
            coinsDisplayText.text = currentCoins.ToString();
        
        if (starsDisplayText != null)
            starsDisplayText.text = currentStars.ToString();
    }
    
    void ShowCurrencyGainEffect(int amount, CurrencyType type)
    {
        UIManager uiManager = FindObjectOfType<UIManager>();
        if (uiManager != null)
        {
            string message = type == CurrencyType.Coins ? 
                $"+{amount} monedas" : $"+{amount} estrellas";
            Color color = type == CurrencyType.Coins ? Color.yellow : Color.cyan;
            
            uiManager.ShowNotification(message, color);
        }
    }
    
    void ShowVictoryReward(int coins, int stars)
    {
        UIManager uiManager = FindObjectOfType<UIManager>();
        if (uiManager != null)
        {
            string message = $"¡Victoria!\n+{coins} monedas";
            if (stars > 0)
                message += $"\n+{stars} estrellas";
            
            uiManager.ShowNotification(message, Color.green);
        }
    }
    
    public bool HasEnoughCoins(int amount)
    {
        return currentCoins >= amount;
    }
    
    public void ResetCurrency()
    {
        currentCoins = startingCoins;
        currentStars = startingStars;
        SaveCurrency();
        UpdateUI();
    }
    
    // Daily bonus system
    public void CheckDailyBonus()
    {
        string lastBonusDate = PlayerPrefs.GetString("LastDailyBonus", "");
        string today = DateTime.Now.ToString("yyyy-MM-dd");
        
        if (lastBonusDate != today)
        {
            // Award daily bonus
            int dailyBonus = 50;
            AddCoins(dailyBonus);
            
            PlayerPrefs.SetString("LastDailyBonus", today);
            
            UIManager uiManager = FindObjectOfType<UIManager>();
            if (uiManager != null)
            {
                uiManager.ShowNotification($"¡Bonus diario!\n+{dailyBonus} monedas", Color.gold);
            }
        }
    }
    
    // Achievement rewards
    public void AwardAchievement(string achievementId, int coinReward, int starReward = 0)
    {
        string achievementKey = $"Achievement_{achievementId}";
        if (PlayerPrefs.GetInt(achievementKey, 0) == 0)
        {
            PlayerPrefs.SetInt(achievementKey, 1);
            
            if (coinReward > 0)
                AddCoins(coinReward);
            if (starReward > 0)
                AddStars(starReward);
            
            UIManager uiManager = FindObjectOfType<UIManager>();
            if (uiManager != null)
            {
                string message = "¡Logro desbloqueado!";
                if (coinReward > 0)
                    message += $"\n+{coinReward} monedas";
                if (starReward > 0)
                    message += $"\n+{starReward} estrellas";
                
                uiManager.ShowNotification(message, Color.purple);
            }
        }
    }
}

public enum CurrencyType
{
    Coins,
    Stars
}

public enum GameDifficulty
{
    Easy,
    Medium,
    Hard
}

public enum GameMode
{
    OneVsOne,
    MultiBall,
    TimeAttack,
    Tournament
}