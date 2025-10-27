using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using System;

[System.Serializable]
public class ShopItem
{
    public string id;
    public string name;
    public string description;
    public int price;
    public ShopItemType type;
    public Sprite icon;
    public GameObject prefab;
    public bool isPurchased;
    public bool isEquipped;
}

public enum ShopItemType
{
    Ball,
    Table,
    Environment
}

public class ShopSystem : MonoBehaviour
{
    [Header("Shop UI")]
    public Transform shopItemsParent;
    public GameObject shopItemPrefab;
    public Button ballsTabButton;
    public Button tablesTabButton;
    public Button environmentsTabButton;
    
    [Header("Item Preview")]
    public Transform previewParent;
    public Text itemNameText;
    public Text itemDescriptionText;
    public Text itemPriceText;
    public Button purchaseButton;
    public Button equipButton;
    
    [Header("Shop Items")]
    public List<ShopItem> ballItems = new List<ShopItem>();
    public List<ShopItem> tableItems = new List<ShopItem>();
    public List<ShopItem> environmentItems = new List<ShopItem>();
    
    private CurrencyManager currencyManager;
    private UIManager uiManager;
    private ShopItemType currentTab = ShopItemType.Ball;
    private ShopItem selectedItem;
    private GameObject currentPreviewObject;
    
    void Start()
    {
        currencyManager = FindObjectOfType<CurrencyManager>();
        uiManager = FindObjectOfType<UIManager>();
        
        SetupTabButtons();
        LoadShopData();
        ShowTab(ShopItemType.Ball);
    }
    
    void SetupTabButtons()
    {
        ballsTabButton.onClick.AddListener(() => ShowTab(ShopItemType.Ball));
        tablesTabButton.onClick.AddListener(() => ShowTab(ShopItemType.Table));
        environmentsTabButton.onClick.AddListener(() => ShowTab(ShopItemType.Environment));
        
        purchaseButton.onClick.AddListener(PurchaseSelectedItem);
        equipButton.onClick.AddListener(EquipSelectedItem);
    }
    
    void LoadShopData()
    {
        // Load purchased items from PlayerPrefs
        foreach (var item in ballItems)
        {
            item.isPurchased = PlayerPrefs.GetInt($"Purchased_{item.id}", 0) == 1;
            item.isEquipped = PlayerPrefs.GetString("EquippedBall", "default_ball") == item.id;
        }
        
        foreach (var item in tableItems)
        {
            item.isPurchased = PlayerPrefs.GetInt($"Purchased_{item.id}", 0) == 1;
            item.isEquipped = PlayerPrefs.GetString("EquippedTable", "default_table") == item.id;
        }
        
        foreach (var item in environmentItems)
        {
            item.isPurchased = PlayerPrefs.GetInt($"Purchased_{item.id}", 0) == 1;
            item.isEquipped = PlayerPrefs.GetString("EquippedEnvironment", "default_env") == item.id;
        }
    }
    
    public void ShowTab(ShopItemType tabType)
    {
        currentTab = tabType;
        UpdateTabButtons();
        PopulateShopItems();
    }
    
    void UpdateTabButtons()
    {
        // Reset all tab button colors
        ResetTabButton(ballsTabButton);
        ResetTabButton(tablesTabButton);
        ResetTabButton(environmentsTabButton);
        
        // Highlight active tab
        Button activeButton = null;
        switch (currentTab)
        {
            case ShopItemType.Ball:
                activeButton = ballsTabButton;
                break;
            case ShopItemType.Table:
                activeButton = tablesTabButton;
                break;
            case ShopItemType.Environment:
                activeButton = environmentsTabButton;
                break;
        }
        
        if (activeButton != null)
        {
            ColorBlock colors = activeButton.colors;
            colors.normalColor = Color.yellow;
            activeButton.colors = colors;
        }
    }
    
    void ResetTabButton(Button button)
    {
        ColorBlock colors = button.colors;
        colors.normalColor = Color.white;
        button.colors = colors;
    }
    
    void PopulateShopItems()
    {
        // Clear existing items
        foreach (Transform child in shopItemsParent)
        {
            Destroy(child.gameObject);
        }
        
        List<ShopItem> itemsToShow = GetCurrentTabItems();
        
        foreach (ShopItem item in itemsToShow)
        {
            CreateShopItemUI(item);
        }
    }
    
    List<ShopItem> GetCurrentTabItems()
    {
        switch (currentTab)
        {
            case ShopItemType.Ball:
                return ballItems;
            case ShopItemType.Table:
                return tableItems;
            case ShopItemType.Environment:
                return environmentItems;
            default:
                return ballItems;
        }
    }
    
    void CreateShopItemUI(ShopItem item)
    {
        GameObject itemUI = Instantiate(shopItemPrefab, shopItemsParent);
        
        // Setup item UI components
        Image itemIcon = itemUI.transform.Find("Icon").GetComponent<Image>();
        Text itemName = itemUI.transform.Find("Name").GetComponent<Text>();
        Text itemPrice = itemUI.transform.Find("Price").GetComponent<Text>();
        GameObject purchasedIndicator = itemUI.transform.Find("PurchasedIndicator").gameObject;
        GameObject equippedIndicator = itemUI.transform.Find("EquippedIndicator").gameObject;
        Button itemButton = itemUI.GetComponent<Button>();
        
        // Set item data
        if (itemIcon != null && item.icon != null)
            itemIcon.sprite = item.icon;
        
        if (itemName != null)
            itemName.text = item.name;
        
        if (itemPrice != null)
            itemPrice.text = item.isPurchased ? "COMPRADO" : $"{item.price} monedas";
        
        if (purchasedIndicator != null)
            purchasedIndicator.SetActive(item.isPurchased);
        
        if (equippedIndicator != null)
            equippedIndicator.SetActive(item.isEquipped);
        
        // Setup button click
        if (itemButton != null)
        {
            itemButton.onClick.AddListener(() => SelectItem(item));
        }
    }
    
    void SelectItem(ShopItem item)
    {
        selectedItem = item;
        UpdateItemPreview();
        UpdatePurchaseButton();
    }
    
    void UpdateItemPreview()
    {
        if (selectedItem == null) return;
        
        // Update preview text
        if (itemNameText != null)
            itemNameText.text = selectedItem.name;
        
        if (itemDescriptionText != null)
            itemDescriptionText.text = selectedItem.description;
        
        if (itemPriceText != null)
            itemPriceText.text = $"{selectedItem.price} monedas";
        
        // Update 3D preview
        if (currentPreviewObject != null)
            Destroy(currentPreviewObject);
        
        if (selectedItem.prefab != null && previewParent != null)
        {
            currentPreviewObject = Instantiate(selectedItem.prefab, previewParent);
            
            // Setup preview object (scale, rotation, etc.)
            currentPreviewObject.transform.localPosition = Vector3.zero;
            currentPreviewObject.transform.localRotation = Quaternion.identity;
            
            // Add rotation animation
            PreviewRotator rotator = currentPreviewObject.GetComponent<PreviewRotator>();
            if (rotator == null)
                rotator = currentPreviewObject.AddComponent<PreviewRotator>();
        }
    }
    
    void UpdatePurchaseButton()
    {
        if (selectedItem == null) return;
        
        bool canPurchase = !selectedItem.isPurchased && 
                          currencyManager.GetCoins() >= selectedItem.price;
        
        purchaseButton.gameObject.SetActive(!selectedItem.isPurchased);
        equipButton.gameObject.SetActive(selectedItem.isPurchased);
        
        purchaseButton.interactable = canPurchase;
        
        if (selectedItem.isPurchased)
        {
            equipButton.GetComponentInChildren<Text>().text = 
                selectedItem.isEquipped ? "EQUIPADO" : "EQUIPAR";
            equipButton.interactable = !selectedItem.isEquipped;
        }
    }
    
    void PurchaseSelectedItem()
    {
        if (selectedItem == null || selectedItem.isPurchased) return;
        
        if (currencyManager.SpendCoins(selectedItem.price))
        {
            selectedItem.isPurchased = true;
            PlayerPrefs.SetInt($"Purchased_{selectedItem.id}", 1);
            
            uiManager.ShowNotification($"¡{selectedItem.name} comprado!", Color.green);
            
            RefreshShop();
            UpdatePurchaseButton();
        }
        else
        {
            uiManager.ShowNotification("No tienes suficientes monedas", Color.red);
        }
    }
    
    void EquipSelectedItem()
    {
        if (selectedItem == null || !selectedItem.isPurchased || selectedItem.isEquipped) 
            return;
        
        // Unequip current item of same type
        List<ShopItem> itemsOfType = GetCurrentTabItems();
        foreach (var item in itemsOfType)
        {
            if (item.isEquipped)
            {
                item.isEquipped = false;
            }
        }
        
        // Equip selected item
        selectedItem.isEquipped = true;
        
        // Save to PlayerPrefs
        string equipKey = "";
        switch (selectedItem.type)
        {
            case ShopItemType.Ball:
                equipKey = "EquippedBall";
                break;
            case ShopItemType.Table:
                equipKey = "EquippedTable";
                break;
            case ShopItemType.Environment:
                equipKey = "EquippedEnvironment";
                break;
        }
        
        PlayerPrefs.SetString(equipKey, selectedItem.id);
        
        uiManager.ShowNotification($"¡{selectedItem.name} equipado!", Color.blue);
        
        RefreshShop();
        UpdatePurchaseButton();
    }
    
    public void RefreshShop()
    {
        LoadShopData();
        PopulateShopItems();
        
        // Update currency display
        if (FindObjectOfType<MainMenuController>())
        {
            FindObjectOfType<MainMenuController>().SendMessage("UpdatePlayerInfo", 
                SendMessageOptions.DontRequireReceiver);
        }
    }
    
    public ShopItem GetEquippedItem(ShopItemType type)
    {
        List<ShopItem> items = null;
        switch (type)
        {
            case ShopItemType.Ball:
                items = ballItems;
                break;
            case ShopItemType.Table:
                items = tableItems;
                break;
            case ShopItemType.Environment:
                items = environmentItems;
                break;
        }
        
        if (items != null)
        {
            foreach (var item in items)
            {
                if (item.isEquipped)
                    return item;
            }
        }
        
        return null;
    }
}

// Helper component for preview rotation
public class PreviewRotator : MonoBehaviour
{
    public float rotationSpeed = 30f;
    
    void Update()
    {
        transform.Rotate(Vector3.up * rotationSpeed * Time.deltaTime);
    }
}